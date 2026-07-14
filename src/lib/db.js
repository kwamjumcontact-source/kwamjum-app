import { supabase } from './supabase';

// --- Decks ---

export const getDecks = async (userId) => {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  // Parse category from description (e.g. "[Language] My deck description")
  return data.map(deck => {
    let category = 'General';
    let description = deck.description || '';
    const match = description.match(/^\[(.*?)\] (.*)$/);
    if (match) {
      category = match[1];
      description = match[2];
    } else if (description.startsWith('[')) {
      const closingIdx = description.indexOf(']');
      if (closingIdx !== -1) {
        category = description.substring(1, closingIdx);
        description = description.substring(closingIdx + 1).trim();
      }
    }
    return { ...deck, category, description, raw_description: deck.description };
  });
};

export const createDeck = async (userId, title, description, color, category = 'General') => {
  const encodedDescription = `[${category}] ${description}`;
  const { data, error } = await supabase
    .from('decks')
    .insert([{ user_id: userId, title, description: encodedDescription, color }])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const updateDeck = async (deckId, title, description, color, category = 'General') => {
  const encodedDescription = `[${category}] ${description}`;
  const { data, error } = await supabase
    .from('decks')
    .update({ title, description: encodedDescription, color })
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
  
  // Fix timezone issue if DB strips the 'Z' from timestamp without time zone
  // and check localStorage for exact minute precision (bypasses DB DATE column truncation)
  return data.map(card => {
    let dueStr = card.due_date;
    if (dueStr && !dueStr.endsWith('Z') && !dueStr.includes('+')) {
      dueStr += 'Z';
    }
    
    const localDue = localStorage.getItem(`kwamjum_due_${card.id}`);
    if (localDue) {
      const localDueDate = new Date(parseInt(localDue, 10));
      // Use local precision if it's still valid
      if (localDueDate > new Date()) {
         dueStr = localDueDate.toISOString();
      }
    }
    
    return { ...card, due_date: dueStr };
  });
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

// --- Profile & Streak ---

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
  return data;
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateStreak = async (userId) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    const currentProfile = profile || { current_streak: 0, longest_streak: 0, last_activity_date: null };

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentActivityDate = `${year}-${month}-${day}`;

    let newCurrentStreak = currentProfile.current_streak || 0;
    let newLongestStreak = currentProfile.longest_streak || 0;
    const lastActivityDate = currentProfile.last_activity_date;

    if (!lastActivityDate) {
      newCurrentStreak = 1;
    } else if (lastActivityDate !== currentActivityDate) {
      const lastDate = new Date(lastActivityDate);
      const currentDateObj = new Date(currentActivityDate);
      
      const diffTime = currentDateObj.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays === 1) {
        newCurrentStreak += 1;
      } else if (diffDays > 1) {
        newCurrentStreak = 1;
      }
    }

    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: currentActivityDate,
      })
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedProfile;
  } catch (e) {
    console.error("Streak update error:", e);
    return null;
  }
};

// --- Import / Export ---

export const exportDeck = async (deckId) => {
  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .single();
    
  if (deckError) throw deckError;
  
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId);
    
  if (cardsError) throw cardsError;
  
  return { deck, cards };
};

export const importDeck = async (userId, fileContent, filename = "Imported Deck") => {
  let deckData = null;
  let cardsData = [];
  
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(fileContent);
    if (parsed.deck && parsed.cards) {
      deckData = parsed.deck;
      cardsData = parsed.cards;
    } else {
      throw new Error("Invalid JSON structure");
    }
  } catch (e) {
    // Fallback to CSV
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    deckData = { title: filename.replace('.csv', ''), description: '[Imported] Imported from CSV', color: '#10B981' };
    
    cardsData = lines.map(line => {
      // Basic CSV parsing (not handling quotes properly, but fine for simple cases)
      const parts = line.split(',');
      return {
        front: parts[0]?.trim() || '',
        back: parts.slice(1).join(',')?.trim() || ''
      };
    });
  }
  
  if (cardsData.length === 0) throw new Error("No cards found to import");
  
  // Create the deck
  const newDeck = await createDeck(
    userId, 
    deckData.title + " (Imported)", 
    deckData.raw_description || deckData.description || "Imported deck", 
    deckData.color || '#3B82F6', 
    deckData.category || 'General'
  );
  
  // Prepare cards for bulk insert
  const cardsToInsert = cardsData.map(card => ({
    user_id: userId,
    deck_id: newDeck.id,
    front: card.front,
    back: card.back,
    image_url: card.image_url || null,
    type: card.type || 'basic',
    repetitions: 0,
    ease: 2.5,
    interval: 0,
    due_date: new Date().toISOString()
  }));
  
  // Bulk insert
  const { error } = await supabase.from('cards').insert(cardsToInsert);
  if (error) throw error;
  
  return newDeck;
};
