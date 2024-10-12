'use client';
import dynamic from 'next/dynamic';

const Canvas = dynamic(() => import('../components/canvas'), {
  ssr: false,
});

export default function Page() {
  return <Canvas />;
}