import { NextRequest, NextResponse } from 'next/server';
import { db, users, tasks, profiles, wallet_transactions, admin_wallets, commission_settings } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sql, eq, gte, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Total users count
    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);
    const totalUsers = totalUsersResult?.count || 0;

    // Active tasks count
    const [activeTasksResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(eq(tasks.status, 'open'));
    const activeTasks = activeTasksResult?.count || 0;

    // Total revenue from all admin wallets
    const adminWalletsData = await db.select().from(admin_wallets);
    const totalRevenue = adminWalletsData.reduce((sum, w) => sum + parseFloat(w.balance || '0'), 0);
    
    // Get commission rate
    const [settingsData] = await db
      .select()
      .from(commission_settings)
      .limit(1);
    const commissionRate = settingsData?.commission_percentage || '2.00';

    // Revenue over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const revenueOverTime = await db
      .select({
        month: sql<string>`TO_CHAR(created_at, 'Mon')`,
        year: sql<string>`TO_CHAR(created_at, 'YYYY')`,
        total: sql<number>`SUM(CAST(commission_amount AS DECIMAL))`,
      })
      .from(wallet_transactions)
      .where(
        and(
          gte(wallet_transactions.created_at, twelveMonthsAgo),
          sql`CAST(commission_amount AS DECIMAL) > 0`
        )
      )
      .groupBy(sql`TO_CHAR(created_at, 'Mon')`, sql`TO_CHAR(created_at, 'YYYY')`, sql`DATE_TRUNC('month', created_at)`)
      .orderBy(sql`DATE_TRUNC('month', created_at)`);

    // User growth (last 12 months)
    const userGrowth = await db
      .select({
        month: sql<string>`TO_CHAR(created_at, 'Mon')`,
        year: sql<string>`TO_CHAR(created_at, 'YYYY')`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(users)
      .where(gte(users.created_at, twelveMonthsAgo))
      .groupBy(sql`TO_CHAR(created_at, 'Mon')`, sql`TO_CHAR(created_at, 'YYYY')`, sql`DATE_TRUNC('month', created_at)`)
      .orderBy(sql`DATE_TRUNC('month', created_at)`);

    // Recent activities (last 20 transactions)
    const recentActivities = await db
      .select({
        id: wallet_transactions.id,
        user_id: wallet_transactions.user_id,
        amount: wallet_transactions.amount,
        type: wallet_transactions.type,
        currency: wallet_transactions.currency,
        transaction_type: wallet_transactions.transaction_type,
        description: wallet_transactions.description,
        commission_amount: wallet_transactions.commission_amount,
        created_at: wallet_transactions.created_at,
      })
      .from(wallet_transactions)
      .orderBy(desc(wallet_transactions.created_at))
      .limit(20);

    // Task statistics
    const [completedTasksResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(eq(tasks.status, 'completed'));
    const completedTasks = completedTasksResult?.count || 0;

    const [pendingTasksResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(eq(tasks.status, 'pending'));
    const pendingTasks = pendingTasksResult?.count || 0;

    // Total tasks
    const [totalTasksResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks);
    const totalTasks = totalTasksResult?.count || 0;

    // User statistics
    const [bannedUsersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.is_banned, true));
    const bannedUsers = bannedUsersResult?.count || 0;

    // Commission totals by currency
    const commissionByCurrency = adminWalletsData.map(wallet => ({
      currency: wallet.currency,
      balance: parseFloat(wallet.balance || '0'),
      totalEarned: parseFloat(wallet.total_commission_earned || '0'),
    }));

    return NextResponse.json({
      overview: {
        totalUsers,
        activeTasks,
        totalRevenue: totalRevenue.toFixed(2),
        commissionRate: parseFloat(commissionRate),
      },
      tasks: {
        total: totalTasks,
        active: activeTasks,
        completed: completedTasks,
        pending: pendingTasks,
      },
      users: {
        total: totalUsers,
        banned: bannedUsers,
        active: totalUsers - bannedUsers,
      },
      charts: {
        revenueOverTime: revenueOverTime.map(r => ({
          month: r.month,
          year: r.year,
          total: parseFloat(r.total || '0'),
        })),
        userGrowth: userGrowth.map(u => ({
          month: u.month,
          year: u.year,
          count: u.count,
        })),
      },
      recentActivities: recentActivities.map(activity => ({
        ...activity,
        amount: parseFloat(activity.amount),
        commission_amount: parseFloat(activity.commission_amount || '0'),
      })),
      adminWallets: commissionByCurrency,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
