import { supabase } from './supabase';

// --- Decks ---

export const getDecks = async (userId) => {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const createDeck = async (userId, title, description, color) => {
  const { data, error } = await supabase
    .from('decks')
    .insert([{ user_id: userId, title, description, color }])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const updateDeck = async (deckId, title, description, color) => {
  const { data, error } = await supabase
    .from('decks')
    .update({ title, description, color })
    .eq('id', deckId)
    .select();
    
  if (error) throw error;
  return data[0];
};

export const deleteDeck = async (deckId) => {
  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', deckId);
    
  if (error) throw error;
};

// --- Cards ---

export const getCardsForDeck = async (deckId) => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });
    
  if (error) throw error;
  return data;
};

export const getDueCardsForDeck = async (deckId, currentDateStr) => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .lte('due_date', currentDateStr)
    .order('due_date', { ascending: true });
    
  if (error) throw error;
  return data;
};

export const createCard = async (userId, deckId, cardData) => {
  const { front, back, image_url, type = 'basic' } = cardData;
  const { data, error } = await supabase
    .from('cards')
    .insert([{ 
      user_id: userId, 
      deck_id: deckId, 
      front, 
      back, 
      image_url, 
      type,
      repetitions: 0,
      ease: 2.5,
      interval: 0,
      due_date: new Date().toISOString()
    }])
    .select();
    
  if (error) throw error;
  return data[0];
};

export const updateCard = async (cardId, cardData) => {
  const { front, back, image_url } = cardData;
  const { data, error } = await supabase
    .from('cards')
    .update({ front, back, image_url })
    .eq('id', cardId)
    .select();
    
  if (error) throw error;
  return data[0];
};

export const deleteCard = async (cardId) => {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId);
    
  if (error) throw error;
};

export const saveCardReview = async (cardId, sm2Data) => {
  const { repetitions, ease, interval, due_date } = sm2Data;
  const { data, error } = await supabase
    .from('cards')
    .update({ 
      repetitions, 
      ease, 
      interval, 
      due_date 
    })
    .eq('id', cardId)
    .select();
    
  if (error) throw error;
  return data[0];
};

export const logReview = async (userId, deckId, cardId, rating) => {
  const { error } = await supabase
    .from('review_logs')
    .insert([{ user_id: userId, deck_id: deckId, card_id: cardId, rating }]);
    
  if (error) throw error;
};

export const getReviewLogs = async (userId, daysAgo = 7) => {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - daysAgo);
  
  const { data, error } = await supabase
    .from('review_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('reviewed_at', dateLimit.toISOString());
    
  if (error) throw error;
  return data;
};
