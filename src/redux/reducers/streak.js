import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  current_streak: 0,
  playing: false,
  turn_over: true, // This seems redundant
  time_left: 1000,
  default_time: 2,
  max_rounds: 2,
  stage: 0,
  players: [],
  adding_player: false,
  selected_player: undefined,
  current_card: undefined,
  lcd_turns: 0,
  winners: undefined,
  played_count: 0,
  scoreboard: [],
  playable_deck: [],
  selected_decks: [],
  deck_manifest: [],
};

export const streakSlice = createSlice({
  name: "streak",
  initialState,
  reducers: {
    set_deck_manifest: (state, action) => {
      state.deck_manifest = action.payload;
    },
    set_playable_deck: (state, action) => {
      state.playable_deck = action.payload;
    },
    set_played_count: (state, action) => {
      state.played_count = action.payload;
    },
    set_scoreboard: (state, action) => {
      state.scoreboard = action.payload;
    },
    increment_current: (state) => {
      state.current_streak += 1;
    },
    reset_current: (state) => {
      state.current_streak = 0;
    },
    set_playing: (state, action) => {
      state.playing = action.payload;
    },
    set_turn_over: (state, action) => {
      state.turn_over = action.payload;
    },
    set_time_left: (state, action) => {
      state.time_left = action.payload;
    },
    set_default_time: (state, action) => {
      state.default_time = action.payload;
    },
    set_stage: (state, action) => {
      state.stage = action.payload;
    },
    set_players: (state, action) => {
      state.players = action.payload;
    },
    set_adding_player: (state, action) => {
      state.adding_player = action.payload;
    },
    set_selected_player: (state, action) => {
      state.selected_player = action.payload;
    },
    set_current_card: (state, action) => {
      state.current_card = action.payload;
    },
    delete_card: (state) => {
      state.current_card = undefined;
    },
    increment_lcd_turns: (state, action) => {
      state.lcd_turns += 1;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  increment_current,
  reset_current,
  set_best,
  set_scoreboard,
  set_playing,
  set_turn_over,
  set_time_left,
  set_default_time,
  set_stage,
  set_playable_deck,
  set_players,
  set_adding_player,
  set_selected_player,
  set_deck_manifest,
  set_current_card,
  delete_card,
  set_played_count,
  increment_lcd_turns,
} = streakSlice.actions;

export default streakSlice.reducer;
