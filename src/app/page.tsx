'use client';
import dynamic from 'next/dynamic';
import Canvas from '../components/canvas';

const home = dynamic(() => import('../components/canvas'), {
  ssr: false,
});

export default function Page() {
  return <Canvas />;
}