import { useState, useCallback } from 'react';
import { productosApi } from '../services/api';

export function useProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async (soloActivos = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productosApi.getAll(soloActivos);
      setProductos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (dto) => {
    const nuevo = await productosApi.create(dto);
    setProductos((prev) => [nuevo, ...prev]);
    return nuevo;
  }, []);

  const update = useCallback(async (id, dto) => {
    const updated = await productosApi.update(id, dto);
    setProductos((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await productosApi.delete(id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { productos, loading, error, fetchAll, create, update, remove };
}
