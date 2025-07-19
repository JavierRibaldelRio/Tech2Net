'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [data, setData] = useState<{ message?: string }>({});

  useEffect(() => {
    fetch('http://localhost:3001/api/data')
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);


  const updateData = () => {
    fetch('http://localhost:3001/api/data')
      .then((res) => res.json())
      .then((data) => setData(data));
  };
  return (
    <div>
      <h1>Frontend con Next.js</h1>
      <p>Datos del backend: {data.message}</p>
      <Button onClick={updateData}>Actualizar Datos</Button>
    </div>
  );
}