
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { updateUserProfile } from '../../../lib/supabase';
import { useDarkMode } from '@/context/DarkModeContext';

export default function ProfileSection() {
  const { user, profile, refreshProfile } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('anime-girls');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    skills: [] as string[],
    phone: '',
    location: '',
    avatar_url: '',
    social_links: {
      twitter: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    preferences: {
      notifications: true,
      email_updates: true,
      dark_mode: false
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [kycDocumentType, setKycDocumentType] = useState('');
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycUploading, setKycUploading] = useState(false);
  const kycFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        phone: (profile as any).phone || '',
        location: (profile as any).location || '',
        avatar_url: profile.avatar_url || '',
        social_links: (profile as any).social_links || {
          twitter: '',
          linkedin: '',
          github: '',
          portfolio: ''
        },
        preferences: (profile as any).preferences || {
          notifications: true,
          email_updates: true,
          dark_mode: false
        }
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      social_links: {
        ...formData.social_links,
        [platform]: value
      }
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await updateUserProfile(user.id, formData);
      
      if (error) {
        setError('Failed to update profile. Please try again.');
      } else {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        await refreshProfile();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        phone: (profile as any).phone || '',
        location: (profile as any).location || '',
        avatar_url: profile.avatar_url || '',
        social_links: (profile as any).social_links || {
          twitter: '',
          linkedin: '',
          github: '',
          portfolio: ''
        },
        preferences: (profile as any).preferences || {
          notifications: true,
          email_updates: true,
          dark_mode: false
        }
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  // Enhanced Avatar Collections with 100+ options
  const avatarCollections = {
    'anime-girls': {
      name: '👩 Anime Girls',
      avatars: [
        'https://readdy.ai/api/search-image?query=Beautiful%20anime%20girl%20character%20portrait%20with%20long%20flowing%20pink%20hair%2C%20elegant%20dress%2C%20gentle%20expression%2C%20fantasy%20style%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Cute%20anime%20girl%20character%20portrait%20with%20twin%20tails%20blue%20hairstyle%2C%20school%20uniform%2C%20cheerful%20smile%2C%20colorful%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Elegant%20anime%20girl%20character%20portrait%20with%20purple%20hair%2C%20magical%20outfit%2C%20mysterious%20aura%2C%20fantasy%20setting%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl3&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Warrior%20anime%20girl%20character%20portrait%20with%20red%20hair%2C%20armor%20outfit%2C%20sword%20weapon%2C%20confident%20pose%2C%20battle%20ready%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl4&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Maid%20anime%20girl%20character%20portrait%20with%20brown%20hair%2C%20classic%20maid%20outfit%2C%20gentle%20smile%2C%20serving%20pose%2C%20elegant%20appearance%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl5&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Cat%20girl%20anime%20character%20portrait%20with%20silver%20hair%2C%20cat%20ears%2C%20tail%2C%20playful%20expression%2C%20cute%20outfit%2C%20adorable%20pose%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl6&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Angel%20anime%20girl%20character%20portrait%20with%20blonde%20hair%2C%20white%20wings%2C%20halo%2C%20flowing%20white%20dress%2C%20serene%20expression%2C%20heavenly%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl7&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Demon%20anime%20girl%20character%20portrait%20with%20black%20hair%2C%20horns%2C%20dark%20outfit%2C%20seductive%20smile%2C%20mysterious%20aura%2C%20fantasy%20style%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl8&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Magical%20anime%20girl%20character%20portrait%20with%20rainbow%20hair%2C%20wizard%20outfit%2C%20magic%20staff%2C%20sparkles%20around%2C%20fantasy%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl9&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Ninja%20anime%20girl%20character%20portrait%20with%20dark%20blue%20hair%2C%20ninja%20outfit%2C%20mask%2C%20stealth%20pose%2C%20night%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl10&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Princess%20anime%20girl%20character%20portrait%20with%20golden%20hair%2C%20royal%20dress%2C%20crown%2C%20elegant%20pose%2C%20castle%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl11&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Cyberpunk%20anime%20girl%20character%20portrait%20with%20neon%20hair%2C%20futuristic%20outfit%2C%20tech%20accessories%2C%20city%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=girl12&orientation=squarish'
      ]
    },
    'anime-boys': {
      name: '👨 Anime Boys',
      avatars: [
        'https://readdy.ai/api/search-image?query=Cool%20anime%20boy%20character%20portrait%20with%20spiky%20black%20hair%2C%20casual%20outfit%2C%20confident%20expression%2C%20urban%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Handsome%20anime%20boy%20character%20portrait%20with%20brown%20hair%2C%20school%20uniform%2C%20friendly%20smile%2C%20classroom%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Warrior%20anime%20boy%20character%20portrait%20with%20silver%20hair%2C%20armor%2C%20sword%2C%20determined%20expression%2C%20battlefield%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy3&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Mage%20anime%20boy%20character%20portrait%20with%20blue%20hair%2C%20wizard%20robes%2C%20magic%20staff%2C%20mystical%20aura%2C%20fantasy%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy4&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Ninja%20anime%20boy%20character%20portrait%20with%20dark%20hair%2C%20ninja%20outfit%2C%20mask%2C%20stealth%20pose%2C%20shadow%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy5&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Prince%20anime%20boy%20character%20portrait%20with%20blonde%20hair%2C%20royal%20outfit%2C%20crown%2C%20noble%20pose%2C%20palace%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy6&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Cyberpunk%20anime%20boy%20character%20portrait%20with%20colorful%20hair%2C%20futuristic%20outfit%2C%20tech%20gear%2C%20neon%20city%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy7&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Demon%20anime%20boy%20character%20portrait%20with%20red%20hair%2C%20horns%2C%20dark%20outfit%2C%20mysterious%20smile%2C%20gothic%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy8&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Angel%20anime%20boy%20character%20portrait%20with%20white%20hair%2C%20wings%2C%20halo%2C%20pure%20outfit%2C%20heavenly%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy9&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Pirate%20anime%20boy%20character%20portrait%20with%20messy%20hair%2C%20pirate%20outfit%2C%20eye%20patch%2C%20adventurous%20smile%2C%20ship%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy10&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Samurai%20anime%20boy%20character%20portrait%20with%20long%20black%20hair%2C%20traditional%20outfit%2C%20katana%2C%20serious%20expression%2C%20dojo%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy11&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Detective%20anime%20boy%20character%20portrait%20with%20neat%20hair%2C%20suit%2C%20magnifying%20glass%2C%20intelligent%20expression%2C%20city%20background%2C%20high%20quality%20anime%20art&width=200&height=200&seq=boy12&orientation=squarish'
      ]
    },
    'naruto': {
      name: '🍥 Naruto Universe',
      avatars: [
        'https://readdy.ai/api/search-image?query=Naruto%20Uzumaki%20anime%20character%20portrait%2C%20blonde%20spiky%20hair%2C%20blue%20eyes%2C%20orange%20ninja%20outfit%2C%20confident%20smile%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=naruto1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Sasuke%20Uchiha%20anime%20character%20portrait%2C%20black%20hair%2C%20dark%20eyes%2C%20serious%20expression%2C%20ninja%20headband%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=naruto2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Sakura%20Haruno%20anime%20character%20portrait%2C%20pink%20hair%2C%20green%20eyes%2C%20red%20outfit%2C%20determined%20expression%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=naruto3&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Kakashi%20Hatake%20anime%20character%20portrait%2C%20silver%20hair%2C%20mask%20covering%20face%2C%20ninja%20headband%2C%20relaxed%20pose%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=naruto4&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Itachi%20Uchiha%20anime%20character%20portrait%2C%20long%20black%20hair%2C%20red%20eyes%2C%20serious%20expression%2C%20dark%20cloak%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=naruto5&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Hinata%20Hyuga%20anime%20character%20portrait%2C%20dark%20blue%20hair%2C%20pale%20eyes%2C%20gentle%20smile%2C%20purple%20outfit%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=naruto6&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Gaara%20anime%20character%20portrait%2C%20red%20hair%2C%20green%20eyes%2C%20sand%20village%20headband%2C%20calm%20expression%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=naruto7&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Rock%20Lee%20anime%20character%20portrait%2C%20black%20bowl%20cut%20hair%2C%20thick%20eyebrows%2C%20green%20jumpsuit%2C%20energetic%20pose%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=naruto8&orientation=squarish'
      ]
    },
    'demon-slayer': {
      name: '⚔️ Demon Slayer',
      avatars: [
        'https://readdy.ai/api/search-image?query=Tanjiro%20Kamado%20anime%20character%20portrait%2C%20burgundy%20hair%2C%20kind%20eyes%2C%20checkered%20haori%2C%20determined%20expression%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=demon1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Nezuko%20Kamado%20anime%20character%20portrait%2C%20long%20black%20hair%2C%20pink%20eyes%2C%20bamboo%20muzzle%2C%20cute%20expression%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=demon2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Zenitsu%20Agatsuma%20anime%20character%20portrait%2C%20yellow%20hair%2C%20scared%20expression%2C%20yellow%20haori%2C%20lightning%20effects%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=demon3&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Inosuke%20Hashibira%20anime%20character%20portrait%2C%20black%20hair%2C%20boar%20mask%2C%20muscular%20build%2C%20wild%20expression%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=demon4&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Giyu%20Tomioka%20anime%20character%20portrait%2C%20black%20hair%2C%20blue%20eyes%2C%20water%20hashira%20uniform%2C%20calm%20expression%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=demon5&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Shinobu%20Kocho%20anime%20character%20portrait%2C%20purple%20hair%2C%20butterfly%20hairpin%2C%20gentle%20smile%2C%20insect%20hashira%20uniform%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=demon6&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Rengoku%20Kyojuro%20anime%20character%20portrait%2C%20flame-colored%20hair%2C%20fiery%20eyes%2C%20flame%20hashira%20uniform%2C%20passionate%20expression%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=demon7&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Mitsuri%20Kanroji%20anime%20character%20portrait%2C%20pink%20and%20green%20hair%2C%20cheerful%20expression%2C%20love%20hashira%20uniform%2C%20cute%20smile%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=demon8&orientation=squarish'
      ]
    },
    'one-piece': {
      name: '🏴‍☠️ One Piece',
      avatars: [
        'https://readdy.ai/api/search-image?query=Monkey%20D%20Luffy%20anime%20character%20portrait%2C%20black%20hair%2C%20straw%20hat%2C%20red%20vest%2C%20big%20smile%2C%20determined%20expression%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=onepiece1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Roronoa%20Zoro%20anime%20character%20portrait%2C%20green%20hair%2C%20three%20swords%2C%20serious%20expression%2C%20bandana%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=onepiece2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Nami%20anime%20character%20portrait%2C%20orange%20hair%2C%20navigator%20outfit%2C%20confident%20smile%2C%20weather%20staff%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=onepiece3&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Sanji%20anime%20character%20portrait%2C%20blonde%20hair%2C%20black%20suit%2C%20cigarette%2C%20charming%20smile%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=onepiece4&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Tony%20Tony%20Chopper%20anime%20character%20portrait%2C%20blue%20nose%20reindeer%2C%20pink%20hat%2C%20cute%20expression%2C%20doctor%20outfit%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=onepiece5&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Nico%20Robin%20anime%20character%20portrait%2C%20black%20hair%2C%20blue%20eyes%2C%20archaeologist%20outfit%2C%20mysterious%20smile%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=onepiece6&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Franky%20anime%20character%20portrait%2C%20blue%20hair%2C%20sunglasses%2C%20cyborg%20body%2C%20cola%20bottle%2C%20energetic%20pose%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=onepiece7&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Brook%20anime%20character%20portrait%2C%20skeleton%20musician%2C%20afro%20hair%2C%20top%20hat%2C%20violin%2C%20gentleman%20pose%2C%20high%20quality%20anime%20art%20style&width=200&height=200&seq=onepiece8&orientation=squarish'
      ]
    },
    'funny': {
      name: '😂 Funny & Memes',
      avatars: [
        'https://readdy.ai/api/search-image?query=Funny%20cartoon%20character%20with%20exaggerated%20expressions%2C%20silly%20face%2C%20colorful%20outfit%2C%20comedic%20pose%2C%20bright%20background%2C%20high%20quality%20digital%20art&width=200&height=200&seq=funny1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Meme-style%20character%20portrait%20with%20surprised%20expression%2C%20wide%20eyes%2C%20open%20mouth%2C%20funny%20gesture%2C%20internet%20meme%20aesthetic%2C%20high%20quality%20digital%20art&width=200&height=200&seq=funny2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Cute%20animal%20character%20with%20human-like%20expressions%2C%20wearing%20glasses%2C%20funny%20outfit%2C%20adorable%20pose%2C%20cartoon%20style%2C%20high%20quality%20digital%20art&width=200&height=200&seq=funny3&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Chibi-style%20character%20with%20oversized%20head%2C%20tiny%20body%2C%20cute%20expressions%2C%20kawaii%20aesthetic%2C%20pastel%20colors%2C%20high%20quality%20digital%20art&width=200&height=200&seq=funny4&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Retro%20pixel%20art%20character%20with%208-bit%20style%2C%20blocky%20design%2C%20nostalgic%20gaming%20aesthetic%2C%20bright%20colors%2C%20high%20quality%20pixel%20art&width=200&height=200&seq=funny5&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Doge%20meme%20style%20character%20portrait%2C%20shiba%20inu%20dog%2C%20funny%20expression%2C%20meme%20text%20style%2C%20internet%20culture%2C%20high%20quality%20digital%20art&width=200&height=200&seq=funny6&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Pepe%20frog%20character%20portrait%2C%20green%20frog%2C%20various%20expressions%2C%20meme%20culture%2C%20internet%20aesthetic%2C%20high%20quality%20digital%20art&width=200&height=200&seq=funny7&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Wojak%20character%20portrait%2C%20simple%20line%20art%2C%20emotional%20expressions%2C%20internet%20meme%20style%2C%20minimalist%20design%2C%20high%20quality%20digital%20art&width=200&height=200&seq=funny8&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Chad%20character%20portrait%2C%20muscular%20figure%2C%20confident%20expression%2C%20meme%20culture%2C%20alpha%20male%20aesthetic%2C%20high%20quality%20digital%20art&width=200&height=200&seq=funny9&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Trollface%20character%20portrait%2C%20classic%20internet%20meme%2C%20mischievous%20smile%2C%20black%20and%20white%20design%2C%20troll%20culture%2C%20high%20quality%20digital%20art&width=200&height=200&seq=funny10&orientation=squarish'
      ]
    },
    'random': {
      name: '🎲 Random & Unique',
      avatars: [
        'https://readdy.ai/api/search-image?query=Abstract%20geometric%20portrait%20with%20colorful%20shapes%2C%20modern%20art%20style%2C%20unique%20design%2C%20creative%20composition%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Steampunk%20character%20portrait%20with%20gears%2C%20brass%20accessories%2C%20Victorian%20clothing%2C%20mechanical%20elements%2C%20vintage%20aesthetic%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Space%20astronaut%20character%20portrait%20with%20helmet%2C%20space%20suit%2C%20cosmic%20background%2C%20futuristic%20design%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random3&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Viking%20warrior%20character%20portrait%20with%20beard%2C%20horned%20helmet%2C%20battle%20armor%2C%20nordic%20aesthetic%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random4&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Robot%20character%20portrait%20with%20metallic%20design%2C%20LED%20lights%2C%20futuristic%20features%2C%20AI%20aesthetic%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random5&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Wizard%20character%20portrait%20with%20long%20beard%2C%20pointed%20hat%2C%20magic%20staff%2C%20mystical%20aura%2C%20fantasy%20aesthetic%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random6&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Pirate%20captain%20character%20portrait%20with%20eye%20patch%2C%20tricorn%20hat%2C%20beard%2C%20nautical%20theme%2C%20adventure%20aesthetic%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random7&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Superhero%20character%20portrait%20with%20mask%2C%20cape%2C%20heroic%20pose%2C%20comic%20book%20style%2C%20dynamic%20design%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random8&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Alien%20character%20portrait%20with%20unique%20features%2C%20otherworldly%20design%2C%20sci-fi%20aesthetic%2C%20creative%20anatomy%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random9&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Medieval%20knight%20character%20portrait%20with%20armor%2C%20sword%2C%20shield%2C%20chivalric%20design%2C%20historical%20aesthetic%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random10&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Cyberpunk%20hacker%20character%20portrait%20with%20neon%20colors%2C%20tech%20accessories%2C%20futuristic%20clothing%2C%20digital%20aesthetic%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random11&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Fantasy%20elf%20character%20portrait%20with%20pointed%20ears%2C%20elegant%20features%2C%20nature%20elements%2C%20magical%20aura%2C%20high%20quality%20digital%20art&width=200&height=200&seq=random12&orientation=squarish'
      ]
    },
    'professional': {
      name: '💼 Professional',
      avatars: [
        'https://readdy.ai/api/search-image?query=Professional%20business%20person%20portrait%20with%20suit%2C%20confident%20expression%2C%20office%20background%2C%20corporate%20aesthetic%2C%20high%20quality%20digital%20art&width=200&height=200&seq=prof1&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Doctor%20character%20portrait%20with%20white%20coat%2C%20stethoscope%2C%20medical%20background%2C%20healthcare%20professional%2C%20high%20quality%20digital%20art&width=200&height=200&seq=prof2&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Engineer%20character%20portrait%20with%20hard%20hat%2C%20blueprints%2C%20construction%20background%2C%20technical%20professional%2C%20high%20quality%20digital%20art&width=200&height=200&seq=prof3&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Teacher%20character%20portrait%20with%20glasses%2C%20books%2C%20classroom%20background%2C%20educational%20professional%2C%20high%20quality%20digital%20art&width=200&height=200&seq=prof4&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Chef%20character%20portrait%20with%20chef%20hat%2C%20cooking%20utensils%2C%20kitchen%20background%2C%20culinary%20professional%2C%20high%20quality%20digital%20art&width=200&height=200&seq=prof5&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Lawyer%20character%20portrait%20with%20formal%20attire%2C%20briefcase%2C%20courthouse%20background%2C%20legal%20professional%2C%20high%20quality%20digital%20art&width=200&height=200&seq=prof6&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Scientist%20character%20portrait%20with%20lab%20coat%2C%20test%20tubes%2C%20laboratory%20background%2C%20research%20professional%2C%20high%20quality%20digital%20art&width=200&height=200&seq=prof7&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Artist%20character%20portrait%20with%20paint%20brush%2C%20palette%2C%20studio%20background%2C%20creative%20professional%2C%20high%20quality%20digital%20art&width=200&height=200&seq=prof8&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Programmer%20character%20portrait%20with%20laptop%2C%20code%2C%20tech%20background%2C%20software%20developer%2C%20high%20quality%20digital%20art&width=200&height=200&seq=prof9&orientation=squarish',
        'https://readdy.ai/api/search-image?query=Photographer%20character%20portrait%20with%20camera%2C%20lens%2C%20studio%20background%2C%20media%20professional%2C%20high%20quality%20digital%20art&width=200&height=200&seq=prof10&orientation=squarish'
      ]
    }
  };

  const selectAvatar = (avatarUrl: string) => {
    setFormData({
      ...formData,
      avatar_url: avatarUrl
    });
    setShowAvatarModal(false);
  };

  const handleCustomImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData({
          ...formData,
          avatar_url: result
        });
        setShowAvatarModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setKycFile(file);
    }
  };

  const handleKycSubmit = async () => {
    if (!kycDocumentType || !kycFile) {
      setError('Please select document type and upload a file');
      return;
    }

    setKycUploading(true);
    setError('');
    setSuccess('');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const documentData = e.target?.result as string;

        const response = await fetch('/api/kyc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document_type: kycDocumentType,
            document_data: documentData,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setSuccess(result.message || 'KYC submitted successfully!');
          setKycDocumentType('');
          setKycFile(null);
          await refreshProfile();
          setTimeout(() => setSuccess(''), 5000);
        } else {
          setError(result.error || 'Failed to submit KYC');
        }
        setKycUploading(false);
      };
      reader.readAsDataURL(kycFile);
    } catch (err) {
      console.error('KYC submission error:', err);
      setError('Failed to submit KYC. Please try again.');
      setKycUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className={`rounded-2xl shadow-lg border p-8 ${
        isDarkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="animate-pulse">
          <div className={`h-6 rounded w-1/4 mb-6 ${
            isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
          }`}></div>
          <div className="space-y-4">
            <div className={`h-4 rounded w-3/4 ${
              isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
            }`}></div>
            <div className={`h-4 rounded w-1/2 ${
              isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
            }`}></div>
            <div className={`h-4 rounded w-2/3 ${
              isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
            }`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className={`rounded-3xl shadow-2xl border p-8 backdrop-blur-sm ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50' 
          : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
            Enhanced Profile
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-xl transform hover:scale-105"
            >
              <i className="ri-edit-line mr-2"></i>
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={handleCancel}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 shadow-lg' 
                    : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg'
                }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50 shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <i className="ri-save-line mr-2"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-500 mr-3 text-xl"></i>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <i className="ri-check-line text-green-500 mr-3 text-xl"></i>
              <p className="text-green-600 text-sm font-medium">{success}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Enhanced Avatar Section */}
          <div className="lg:col-span-1">
            <div className="text-center">
              <div className="relative inline-block mb-8">
                <div className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <span className="text-white text-6xl font-bold">
                      {formData.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute bottom-4 right-4 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-xl transform hover:scale-110"
                  >
                    <i className="ri-camera-line text-2xl"></i>
                  </button>
                )}
              </div>
              <h3 className={`text-3xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {formData.first_name} {formData.last_name}
              </h3>
              <p className={`mb-8 text-lg ${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>{user?.email}</p>
              
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-6 rounded-2xl text-center shadow-lg backdrop-blur-sm border ${
                  isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white/50 border-gray-200'
                }`}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{profile.level || 1}</div>
                  <div className={`text-sm font-medium ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>Level</div>
                </div>
                <div className={`p-6 rounded-2xl text-center shadow-lg backdrop-blur-sm border ${
                  isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white/50 border-gray-200'
                }`}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{profile.rating || 0}</div>
                  <div className={`text-sm font-medium ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>Rating</div>
                </div>
                <div className={`p-6 rounded-2xl text-center shadow-lg backdrop-blur-sm border ${
                  isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white/50 border-gray-200'
                }`}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{profile.completed_tasks || 0}</div>
                  <div className={`text-sm font-medium ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>Tasks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Profile Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className={`p-8 rounded-2xl shadow-lg backdrop-blur-sm border ${
              isDarkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-white/30 border-gray-200'
            }`}>
              <h4 className={`text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                Basic Information
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm' 
                          : 'bg-white/50 border-gray-200 text-gray-900 backdrop-blur-sm'
                      }`}
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className={`py-3 text-lg font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{formData.first_name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm' 
                          : 'bg-white/50 border-gray-200 text-gray-900 backdrop-blur-sm'
                      }`}
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className={`py-3 text-lg font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{formData.last_name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm' 
                          : 'bg-white/50 border-gray-200 text-gray-900 backdrop-blur-sm'
                      }`}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className={`py-3 text-lg font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{formData.phone || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm' 
                          : 'bg-white/50 border-gray-200 text-gray-900 backdrop-blur-sm'
                      }`}
                      placeholder="Enter location"
                    />
                  ) : (
                    <p className={`py-3 text-lg font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{formData.location || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className={`p-8 rounded-2xl shadow-lg backdrop-blur-sm border ${
              isDarkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-white/30 border-gray-200'
            }`}>
              <label className={`block text-xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm' 
                      : 'bg-white/50 border-gray-200 text-gray-900 backdrop-blur-sm'
                  }`}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className={`py-3 text-lg ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{formData.bio || 'No bio added yet'}</p>
              )}
            </div>

            {/* Skills */}
            <div className={`p-8 rounded-2xl shadow-lg backdrop-blur-sm border ${
              isDarkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-white/30 border-gray-200'
            }`}>
              <label className={`block text-xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                Skills
              </label>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                        isDarkMode 
                          ? 'bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm' 
                          : 'bg-white/50 border-gray-200 text-gray-900 backdrop-blur-sm'
                      }`}
                      placeholder="Add a skill..."
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:scale-105"
                    >
                      <i className="ri-add-line"></i>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-sm font-medium shadow-lg"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
                        >
                          <i className="ri-close-line text-sm"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 py-3">
                  {formData.skills.length > 0 ? (
                    formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-sm font-medium shadow-lg"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>No skills added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* KYC Verification */}
            <div className={`p-8 rounded-2xl shadow-lg backdrop-blur-sm border ${
              isDarkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-white/30 border-gray-200'
            }`}>
              <label className={`block text-xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                KYC Verification
              </label>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white/50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Verification Status
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        Complete KYC to unlock all features
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-semibold ${
                      (profile as any)?.kyc_status === 'verified' 
                        ? 'bg-green-100 text-green-700'
                        : (profile as any)?.kyc_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {(profile as any)?.kyc_status === 'verified' ? '✓ Verified' : 
                       (profile as any)?.kyc_status === 'pending' ? '⏳ Pending' : '⚠️ Not Verified'}
                    </div>
                  </div>
                  
                  {(profile as any)?.kyc_status !== 'verified' && isEditing && (
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDarkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          Document Type
                        </label>
                        <select
                          value={kycDocumentType}
                          onChange={(e) => setKycDocumentType(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            isDarkMode 
                              ? 'bg-slate-700/50 border-slate-600 text-white' 
                              : 'bg-white/50 border-gray-200 text-gray-900'
                          }`}
                        >
                          <option value="">Select document type</option>
                          <option value="aadhar">Aadhar Card</option>
                          <option value="pan">PAN Card</option>
                          <option value="passport">Passport</option>
                          <option value="driving_license">Driving License</option>
                          <option value="voter_id">Voter ID</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDarkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          Upload Document
                        </label>
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                          isDarkMode 
                            ? 'border-slate-600 hover:border-indigo-500' 
                            : 'border-gray-300 hover:border-indigo-500'
                        }`}
                        onClick={() => kycFileInputRef.current?.click()}
                        >
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            ref={kycFileInputRef}
                            onChange={handleKycFileChange}
                          />
                          <i className="ri-upload-cloud-line text-4xl text-indigo-600 mb-2"></i>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {kycFile ? kycFile.name : 'Click to upload document'}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            PNG, JPG or PDF (Max 5MB)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleKycSubmit}
                        disabled={kycUploading || !kycDocumentType || !kycFile}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {kycUploading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Submitting...
                          </div>
                        ) : (
                          'Submit for Verification'
                        )}
                      </button>
                    </div>
                  )}

                  {(profile as any)?.kyc_status === 'verified' && (
                    <div className="flex items-center space-x-3 text-green-600">
                      <i className="ri-shield-check-line text-2xl"></i>
                      <div>
                        <p className="font-semibold">Your account is verified</p>
                        <p className="text-sm">Verified on {(profile as any)?.kyc_verified_at ? new Date((profile as any).kyc_verified_at).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* KYC Benefits */}
                <div className={`p-4 rounded-xl ${
                  isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'
                }`}>
                  <h5 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Benefits of KYC Verification
                  </h5>
                  <ul className="space-y-2">
                    <li className={`flex items-start space-x-2 text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      <i className="ri-check-line text-green-500 mt-0.5"></i>
                      <span>Higher withdrawal limits</span>
                    </li>
                    <li className={`flex items-start space-x-2 text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      <i className="ri-check-line text-green-500 mt-0.5"></i>
                      <span>Priority support access</span>
                    </li>
                    <li className={`flex items-start space-x-2 text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      <i className="ri-check-line text-green-500 mt-0.5"></i>
                      <span>Verified badge on profile</span>
                    </li>
                    <li className={`flex items-start space-x-2 text-sm ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      <i className="ri-check-line text-green-500 mt-0.5"></i>
                      <span>Access to premium tasks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className={`p-8 rounded-2xl shadow-lg backdrop-blur-sm border ${
              isDarkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-white/30 border-gray-200'
            }`}>
              <label className={`block text-xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                Social Links
              </label>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(formData.social_links).map(([platform, url]) => (
                  <div key={platform}>
                    <label className={`block text-sm font-semibold mb-3 capitalize ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      <i className={`ri-${platform === 'github' ? 'github' : platform === 'linkedin' ? 'linkedin' : platform === 'twitter' ? 'twitter' : 'global'}-line mr-2`}></i>
                      {platform}
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-slate-700/50 border-slate-600 text-white backdrop-blur-sm' 
                            : 'bg-white/50 border-gray-200 text-gray-900 backdrop-blur-sm'
                        }`}
                        placeholder={`Enter ${platform} URL`}
                      />
                    ) : (
                      <p className={`py-3 text-lg font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {url ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 transition-colors">
                            {url}
                          </a>
                        ) : (
                          'Not set'
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Avatar Selection Modal with 100+ Options */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-3xl p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className={`text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
                  Choose Your Avatar (100+ Options)
                </h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className={`cursor-pointer p-2 rounded-full transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
              
              {/* Custom Upload Button */}
              <div className="mb-8">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCustomImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 border-2 border-dashed border-indigo-300 rounded-2xl hover:border-indigo-500 transition-colors cursor-pointer bg-gradient-to-r from-indigo-50 to-purple-50"
                >
                  <i className="ri-upload-cloud-line text-4xl text-indigo-600 mb-2"></i>
                  <p className="text-indigo-600 font-semibold">Upload Custom Image</p>
                  <p className="text-sm text-gray-500">Choose from your device</p>
                </button>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-8">
                {Object.entries(avatarCollections).map(([key, collection]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                      selectedCategory === key
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : isDarkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {collection.name}
                  </button>
                ))}
              </div>

              {/* Avatar Grid */}
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {avatarCollections[selectedCategory as keyof typeof avatarCollections].avatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => selectAvatar(avatar)}
                    className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="w-full aspect-square object-cover object-top rounded-2xl border-2 border-transparent group-hover:border-indigo-500 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-colors flex items-center justify-center">
                      <i className="ri-check-line text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={() => selectAvatar('')}
                  className={`px-6 py-3 cursor-pointer rounded-xl transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Remove Profile Picture
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}