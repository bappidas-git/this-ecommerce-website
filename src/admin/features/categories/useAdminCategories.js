import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminCategoryService } from '../../../api/services/admin/adminCategoryService.js';
import { adminProductService } from '../../../api/services/admin/adminProductService.js';

const sortBySortOrder = (a, b) =>
  (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
  String(a.name || '').localeCompare(String(b.name || ''));

const buildTree = (flat) => {
  const map = new Map();
  const roots = [];
  flat.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });
  map.forEach((node) => {
    const parentId = node.parentId ?? null;
    if (parentId == null) {
      roots.push(node);
    } else {
      const parent = map.get(parentId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  });
  const sortRec = (nodes) => {
    nodes.sort(sortBySortOrder);
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
};

const collectDescendantIds = (tree, id) => {
  const ids = new Set();
  const walk = (nodes) => {
    nodes.forEach((n) => {
      if (n.id === id) {
        const collect = (children) => {
          children.forEach((c) => {
            ids.add(c.id);
            collect(c.children);
          });
        };
        collect(n.children);
      } else {
        walk(n.children);
      }
    });
  };
  walk(tree);
  return ids;
};

export default function useAdminCategories() {
  const [items, setItems] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async (silent = false) => {
    const id = ++requestIdRef.current;
    if (!silent) setIsLoading(true);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        adminCategoryService.list({ perPage: 500 }),
        adminProductService.list({ perPage: 1000 }),
      ]);
      if (id !== requestIdRef.current) return;
      const cats = Array.isArray(catsRes?.items) ? catsRes.items : [];
      const prods = Array.isArray(prodsRes?.items) ? prodsRes.items : [];
      const counts = {};
      prods.forEach((p) => {
        const cid = p.categoryId;
        if (cid == null) return;
        counts[cid] = (counts[cid] || 0) + 1;
      });
      setItems(cats);
      setProductCounts(counts);
      setError(null);
    } catch (err) {
      if (id !== requestIdRef.current) return;
      setError(err);
    } finally {
      if (id === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tree = useMemo(() => buildTree(items), [items]);

  const dependentCount = useCallback(
    (id) => {
      if (id == null) return { products: 0, categories: 0 };
      const products = productCounts[id] || 0;
      const childCats = items.filter((c) => c.parentId === id).length;
      return { products, categories: childCats };
    },
    [items, productCounts],
  );

  const descendantIds = useCallback((id) => collectDescendantIds(tree, id), [tree]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return {
    items,
    tree,
    productCounts,
    dependentCount,
    descendantIds,
    error,
    isLoading,
    refetch,
    setItems,
  };
}
