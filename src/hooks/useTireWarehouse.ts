import { useState, useEffect } from 'react';
import { Tire } from '../types/Vehicle';

const STORAGE_KEY = 'tireWarehouse';

export const useTireWarehouse = () => {
  const [tires, setTires] = useState<Tire[]>(() => {
    const storedTires = localStorage.getItem(STORAGE_KEY);
    return storedTires ? JSON.parse(storedTires) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tires));
  }, [tires]);

  const addTire = (tire: Tire) => {
    setTires(prevTires => [...prevTires, tire]);
  };

  const updateTire = (updatedTire: Tire) => {
    setTires(prevTires =>
      prevTires.map(tire => (tire.id === updatedTire.id ? updatedTire : tire))
    );
  };

  const deleteTire = (tireId: string) => {
    setTires(prevTires => prevTires.filter(tire => tire.id !== tireId));
  };

  const resetWarehouse = () => {
    setTires([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    tires,
    addTire,
    updateTire,
    deleteTire,
    resetWarehouse
  };
}; 