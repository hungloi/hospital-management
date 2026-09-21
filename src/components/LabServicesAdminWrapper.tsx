'use client';

import dynamic from 'next/dynamic';

const LabServicesAdmin = dynamic(() => import('@/components/LabServicesAdmin'), { ssr: false });

export default function LabServicesAdminWrapper() {
  return <LabServicesAdmin />;
}
