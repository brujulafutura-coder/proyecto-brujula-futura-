import { motion } from 'framer-motion';

const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: { repeat: Infinity, duration: 1.5, ease: 'linear' },
  },
};

function SkeletonBlock({ width = '100%', height = '20px', radius = '8px', style = {} }) {
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      style={{
        width, height, borderRadius: radius,
        background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--r-md)',
      padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      border: '1px solid var(--border-subtle)',
    }}>
      <SkeletonBlock height="14px" width="40%" />
      <SkeletonBlock height="22px" width="80%" />
      <SkeletonBlock height="14px" width="100%" />
      <SkeletonBlock height="14px" width="60%" />
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <SkeletonBlock height="32px" width="80px" radius="var(--r-full)" />
        <SkeletonBlock height="32px" width="100px" radius="var(--r-full)" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonBlock;
