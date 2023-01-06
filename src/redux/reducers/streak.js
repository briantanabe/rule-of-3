import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  current_streak: 0,
  best_streak: 0,
  playing: false,
  turn_over: true,
  game_over: false,
  time_left: 20,
  default_time: 75,
  stage: 0,
  players: [],
  adding_player: false,
  selected_player: undefined,
};

export const streakSlice = createSlice({
  name: "streak",
  initialState,
  reducers: {
    increment_current: (state) => {
      state.current_streak += 1;
    },
    reset_current: (state) => {
      state.current_streak = 0;
    },
    set_best: (state, action) => {
      state.best_streak = action.payload;
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
  },
});

// Action creators are generated for each case reducer function
export const {
  increment_current,
  reset_current,
  set_best,
  set_playing,
  set_turn_over,
  set_time_left,
  set_default_time,
  set_stage,
  set_players,
  set_adding_player,
  set_selected_player,
} = streakSlice.actions;

export default streakSlice.reducer;
