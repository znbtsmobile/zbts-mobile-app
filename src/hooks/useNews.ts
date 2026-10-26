import { useState, useEffect, useCallback } from "react";
import {
  auth,
  db,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  handleFirestoreError,
  OperationType,
  logFirestoreRead
} from "../services/firebase";
import { NewsItem, NewsCategory } from "../types";
import { playSuccessSound } from "../services/audio";

// Shared in-memory cache and singleton listener to prevent redundant news reads
let cachedNews: NewsItem[] | null = null;
let activeUnsub: (() => void) | null = null;
const subscribers = new Set<(items: NewsItem[]) => void>();
let disconnectTimeout: any = null;

function subscribeToNews() {
  if (activeUnsub) return;
  if (!auth.currentUser) return;

  logFirestoreRead("useNews (Singleton Listener)", "news (limit 25)");

  const q = query(collection(db, "news"), orderBy("timestamp", "desc"), limit(25));
  activeUnsub = onSnapshot(
    q,
    (snapshot) => {
      const fetched: NewsItem[] = [];
      snapshot.docs.forEach((d: any) => {
        fetched.push({
          id: d.id,
          ...d.data()
        } as NewsItem);
      });
      cachedNews = fetched;
      subscribers.forEach((cb) => cb(fetched));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "news");
    }
  );
}

export const useNews = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(() => cachedNews || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedNews);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    if (disconnectTimeout) {
      clearTimeout(disconnectTimeout);
      disconnectTimeout = null;
    }

    const handler = (items: NewsItem[]) => {
      setNewsItems(items);
      setLoading(false);
    };

    subscribers.add(handler);

    if (cachedNews) {
      setNewsItems(cachedNews);
      setLoading(false);
    }

    subscribeToNews();

    return () => {
      subscribers.delete(handler);
      if (subscribers.size === 0 && activeUnsub) {
        disconnectTimeout = setTimeout(() => {
          if (subscribers.size === 0 && activeUnsub) {
            activeUnsub();
            activeUnsub = null;
          }
        }, 45000);
      }
    };
  }, []);

  const postNews = useCallback(async (
    title: string,
    content: string,
    category: NewsCategory,
    author: string
  ): Promise<string | null> => {
    try {
      const newItem = {
        title: title.trim() || "Taarifa Muhimu",
        content: content.trim(),
        category,
        author: author.trim() || "ZNBTS Staff",
        timestamp: Date.now()
      };

      const docRef = await addDoc(collection(db, "news"), newItem);
      playSuccessSound();
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "news");
      return null;
    }
  }, []);

  const deleteNews = useCallback(async (id: string) => {
    try {
      const docRef = doc(db, "news", id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `news/${id}`);
    }
  }, []);

  return {
    newsItems,
    loading,
    postNews,
    deleteNews
  };
};
