import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const env = fs.readFileSync(".env", "utf8");
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function run() {
  const {data: cards} = await supabase.from("cards").select("id").limit(1);
  if(!cards || !cards.length) return;
  const {error} = await supabase.from("cards").update({
      repetitions: 1, 
      ease: 2.5, 
      interval: 0.00694, 
      due_date: new Date().toISOString()
  }).eq("id", cards[0].id);
  console.log("ERROR:", error);
}
run();
