import { NextRequest, NextResponse } from 'next/server';
import { db, campaigns, campaign_bonus_payments, campaign_members, wallet_transactions, profiles, campaign_chat_messages, users } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';

// POST /api/campaigns/[id]/bonus-payment - Send bonus payment to worker
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campaignId = params.id;
    const body = await request.json();
    const { worker_id, amount, note } = body;

    if (!worker_id || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid request: worker_id and positive amount are required' },
        { status: 400 }
      );
    }

    // Verify campaign ownership
    const [campaign] = await db.select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.employer_id !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Forbidden: Only the campaign owner can send bonus payments' },
        { status: 403 }
      );
    }

    // Verify worker is a member
    const [workerMembership] = await db.select()
      .from(campaign_members)
      .where(
        and(
          eq(campaign_members.campaign_id, campaignId),
          eq(campaign_members.user_id, worker_id),
          eq(campaign_members.status, 'active')
        )
      );

    if (!workerMembership) {
      return NextResponse.json(
        { error: 'Worker is not an active member of this campaign' },
        { status: 400 }
      );
    }

    // Check escrow balance (optional - can be enhanced later)
    // const escrowBalance = parseFloat(campaign.escrow_balance);
    // if (escrowBalance < amount) {
    //   return NextResponse.json(
    //     { error: 'Insufficient escrow balance' },
    //     { status: 400 }
    //   );
    // }

    // Create wallet transaction for the payment
    const [walletTransaction] = await db.insert(wallet_transactions).values({
      user_id: worker_id,
      amount: amount.toString(),
      type: 'credit',
      transaction_type: 'campaign_bonus',
      currency: campaign.currency,
      description: `Bonus payment from campaign: ${campaign.name}`,
      status: 'completed',
      from_user_id: currentUser.userId,
      to_user_id: worker_id,
    }).returning();

    // Update worker's wallet balance based on currency
    const currencyField = `wallet_balance_${campaign.currency.toLowerCase()}` as 'wallet_balance_inr' | 'wallet_balance_usd' | 'wallet_balance_usdt';
    await db.update(profiles)
      .set({
        [currencyField]: sql`${profiles[currencyField]} + ${amount}`,
      })
      .where(eq(profiles.user_id, worker_id));

    // Record bonus payment
    const [bonusPayment] = await db.insert(campaign_bonus_payments).values({
      campaign_id: campaignId,
      from_user_id: currentUser.userId,
      to_user_id: worker_id,
      amount: amount.toString(),
      currency: campaign.currency,
      note,
      wallet_transaction_id: walletTransaction.id,
    }).returning();

    // Update member's total_earned
    await db.update(campaign_members)
      .set({
        total_earned: sql`${campaign_members.total_earned} + ${amount}`,
      })
      .where(
        and(
          eq(campaign_members.campaign_id, campaignId),
          eq(campaign_members.user_id, worker_id)
        )
      );

    // Update campaign total_spent
    await db.update(campaigns)
      .set({
        total_spent: sql`${campaigns.total_spent} + ${amount}`,
        updated_at: new Date(),
      })
      .where(eq(campaigns.id, campaignId));

    // Add payment notification to chat
    if (campaign.group_chat_enabled) {
      const [workerUser] = await db.select()
        .from(users)
        .where(eq(users.id, worker_id));

      const workerName = workerUser 
        ? `${workerUser.first_name} ${workerUser.last_name}`.trim() 
        : 'A worker';

      await db.insert(campaign_chat_messages).values({
        campaign_id: campaignId,
        sender_id: currentUser.userId,
        content: `💰 ${workerName} received a bonus payment of ${campaign.currency} ${amount}!`,
        message_type: 'payment_notification',
        metadata: {
          bonus_payment_id: bonusPayment.id,
          amount,
          currency: campaign.currency,
          worker_id,
        },
      });
    }

    return NextResponse.json({ 
      bonusPayment,
      walletTransaction,
    });
  } catch (error) {
    console.error('Send bonus payment error:', error);
    return NextResponse.json(
      { error: 'Failed to send bonus payment' },
      { status: 500 }
    );
  }
}
