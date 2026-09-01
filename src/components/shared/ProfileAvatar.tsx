import type { CSSProperties } from 'react';
import type { AccountProfile } from '../../services/authService';

interface ProfileAvatarProps {
  profile: Pick<AccountProfile, 'name' | 'avatarEmoji' | 'avatarUrl'> | null | undefined;
  size?: number;
  radius?: number;
  background?: string;
  className?: string;
  style?: CSSProperties;
}

export function ProfileAvatar({
  profile,
  size = 48,
  radius = Math.round(size * 0.34),
  background = 'linear-gradient(140deg,#FFD9DC,#E3D7F7)',
  className,
  style,
}: ProfileAvatarProps) {
  const shared: CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    flex: 'none',
    objectFit: 'cover',
    background,
    ...style,
  };

  if (profile?.avatarUrl) {
    return <img className={className} src={profile.avatarUrl} alt={`Profile picture ${profile.name}`} style={shared} />;
  }

  return (
    <span className={className} role="img" aria-label={`${profile?.name || 'User'} avatar`} style={{ ...shared, display: 'grid', placeItems: 'center', fontSize: size * 0.43 }}>
      {profile?.avatarEmoji || '🙂'}
    </span>
  );
}
