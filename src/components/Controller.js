import React, { useRef, useState, useEffect, useMemo } from "react";
import { Shadow } from "react-native-shadow-2";
import { Dimensions, View } from "react-native";
import { TabActions } from "@react-navigation/native";

import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Text from "../components/Text";
import styled from "styled-components";
import Button from "../components/Button";

import type { RootState } from "../redux/store";
import { useSelector, useDispatch } from "react-redux";
import {
  increment_current,
  set_playable_deck,
  reset_current,
  set_best,
  set_playing,
  set_played_count,
  set_turn_over,
  set_time_left,
  set_scoreboard,
  set_adding_player,
  set_stage,
  set_players,
  delete_card,
  set_selected_player,
  increment_lcd_turns,
} from "../redux/reducers/streak";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const controllerWidth_px = screenWidth * 0.9;
const controllerHeight_px = screenWidth * 0.2;
const bottom_margin = screenWidth * 0.09;

export default Controller = (props) => {
  const max_rounds = useSelector((state) => state.streak.max_rounds);
  const lcd_turns = useSelector((state) => state.streak.lcd_turns);
  const selected_player = useSelector((state) => state.streak.selected_player);
  const players = useSelector((state) => state.streak.players);
  const stage = useSelector((state) => state.streak.stage);
  const default_time = useSelector((state) => state.streak.default_time);
  const time_left = useSelector((state) => state.streak.time_left);
  const current_streak = useSelector((state) => state.streak.current_streak);
  const played_count = useSelector((state) => state.streak.played_count);
  const scoreboard = useSelector((state) => state.streak.scoreboard);
  const playable_deck = useSelector((state) => state.streak.playable_deck);
  const deck_manifest = useSelector((state) => state.streak.deck_manifest);

  // const [secondsLeft, setSecondsLeft] = useState(10);
  // const [countdownActive, setCountdownActive] = useState(false);
  const playing = useSelector((state) => state.streak.playing);
  const playingRef = useRef();
  playingRef.current = playing;
  const dispatch = useDispatch();

  const delay = (delayInms) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
  };

  const countDown = async () => {
    await delay(1000);
    if (time_left > 0 && playingRef.current) {
      if (time_left == 1) {
        dispatch(set_playing(false));
        dispatch(set_played_count(played_count + 1));
      }
      dispatch(set_time_left(time_left - 1));
    }
  };

  useEffect(() => {
    if (playingRef.current) {
      countDown();
    }
  }, [time_left, playing]);

  if (stage == 0) {
    return (
      <Container>
        <Shadow
          startColor={"#0002"}
          offset={[0, controllerWidth_px * 0.025]}
          distance={controllerWidth_px * 0.1}
        >
          <Container inner={true}>
            <View
              style={{
                top: screenWidth * -0.005,
                flexDirection: "row",
                justifyContent: "space-evenly",
                paddingLeft: screenWidth * 0.05,
                paddingRight: screenWidth * 0.05,
                alignItems: "center",
                background: "red",
              }}
            >
              <Button
                onPress={() => {
                  dispatch(set_adding_player(true));
                }}
              >
                <View
                  style={{
                    height: screenWidth * 0.18,
                    width: screenWidth * 0.4,
                    alignItems: "center",
                    justifyContent: "center",
                    // backgroundColor: "blue",
                  }}
                >
                  <FontAwesome5
                    name={"plus"}
                    size={screenWidth * 0.08}
                    color="black"
                  />
                  <View style={{ top: screenWidth * 0.02 }}>
                    <Text black medium center color={"black"}>
                      Add Player
                    </Text>
                  </View>
                </View>
              </Button>
              <Button
                active={players.length > 1}
                onPress={() => {
                  console.log(
                    "TEST",
                    typeof deck_manifest[players[0].decks[0]].contents
                  );
                  dispatch(set_selected_player(0));
                  dispatch(set_stage(1));
                  // dispatch(set_playable_deck());
                  let newArr = [...players];
                  let tmpDeck = [];
                  let addedDecks = [];
                  for (let i = 0; i < players.length; i++) {
                    newArr[i].score = 0;
                    // Create array of cards from players[i].deck
                    // Add each element to greater array with players[i].name
                    for (let j = 0; j < players[i].decks.length; j++) {
                      if (!addedDecks.includes(players[i].decks[j])) {
                        let player_list = [players[i].id];
                        for (let k = 0; k < players.length; k++) {
                          if (players[k].decks.includes(i)) {
                            player_list.push(players[k].id);
                          }
                        }
                        for (
                          let k = 0;
                          k <
                          deck_manifest[players[i].decks[j]].contents.contents
                            .length;
                          k++
                        ) {
                          tmpDeck.push({
                            card: deck_manifest[players[i].decks[j]].contents
                              .contents[k],
                            player: player_list,
                          });
                        }
                      }
                    }
                  }
                  dispatch(set_playable_deck(tmpDeck));
                  dispatch(set_players(newArr));
                }}
              >
                <View
                  style={{
                    height: screenWidth * 0.18,
                    width: screenWidth * 0.4,
                    alignItems: "center",
                    justifyContent: "center",
                    // backgroundColor: "red",
                    opacity: players.length > 1 ? 1 : 0.3,
                  }}
                >
                  <FontAwesome5
                    name={"play"}
                    size={screenWidth * 0.055}
                    color="black"
                  />
                  <View style={{ top: screenWidth * 0.035 }}>
                    <Text black medium center color={"black"}>
                      Ready
                    </Text>
                  </View>
                </View>
              </Button>
            </View>
          </Container>
        </Shadow>
      </Container>
    );
  } else if (stage == 1) {
    return (
      <Container>
        <Shadow
          startColor={"#0002"}
          offset={[0, controllerWidth_px * 0.025]}
          distance={controllerWidth_px * 0.1}
        >
          <Container inner={true}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                paddingLeft: screenWidth * 0.05,
                paddingRight: screenWidth * 0.05,
                alignItems: "center",
              }}
            >
              <Button onPress={() => dispatch(set_stage(0))}>
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: screenWidth * 0.2,
                    height: screenWidth * 0.2,
                    // backgroundColor: "red",
                  }}
                >
                  <Text black medium center color={"#666"}>
                    Back
                  </Text>
                </View>
              </Button>
              <Button
                onPress={() => {
                  dispatch(set_stage(2));
                  dispatch(set_time_left(default_time));
                  dispatch(reset_current());
                }}
              >
                <View
                  style={{
                    // backgroundColor: "blue",
                    height: screenWidth * 0.2,
                    width: screenWidth * 0.6,
                    justifyContent: "center",
                  }}
                >
                  <Text black xlarge center color={"black"}>
                    {"Start"}
                  </Text>
                </View>
              </Button>
            </View>
          </Container>
        </Shadow>
      </Container>
    );
  } else if (stage == 2) {
    if (playing ? null : time_left == 0) {
      return (
        <Container>
          <Shadow
            startColor={"#0002"}
            offset={[0, controllerWidth_px * 0.025]}
            distance={controllerWidth_px * 0.1}
          >
            <Container inner={true}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  paddingLeft: screenWidth * 0.05,
                  paddingRight: screenWidth * 0.05,
                  alignItems: "center",
                }}
              >
                <Button
                  active={selected_player != undefined}
                  onPress={() => {
                    // Check if should update LCD

                    // if (
                    //   !players
                    //     .map((item, index) => {
                    //       if (index == selected_player) {
                    //         return {
                    //           ...item,
                    //           score: item.score + current_streak,
                    //           turns: item.turns + 1,
                    //         };
                    //       } else {
                    //         return item;
                    //       }
                    //     })
                    //     .some((item) => item.turns == lcd_turns)
                    // ) {
                    //   if (lcd_turns == max_rounds - 1) {
                    //     let winners = [];
                    //     let max_score = 0;
                    //     players.forEach((player, index) => {
                    //       let score =
                    //         player.score +
                    //         (index == selected_player ? current_streak : 0);
                    //       console.log("------");
                    //       console.log("Evaluating", player.name);
                    //       console.log(player);
                    //       console.log("Current Max", max_score);
                    //       if (score > max_score) {
                    //         console.log(
                    //           "My score of",
                    //           score,
                    //           "is greater than the last max of",
                    //           max_score
                    //         );
                    //         max_score = score;
                    //         winners = [player];
                    //       } else if (score == max_score) {
                    //         console.log(
                    //           "My score of",
                    //           score,
                    //           "is equal to the last max of",
                    //           max_score
                    //         );
                    //         winners.push(player);
                    //       } else {
                    //         console.log(
                    //           "My score of",
                    //           score,
                    //           "is neither equal or greater thanthe last max of",
                    //           max_score
                    //         );
                    //       }
                    //     });
                    //     console.log("GO TO WINNERS SCREEN");
                    //     console.log("Winners:", winners);
                    //     console.log("Score:", max_score);
                    //     console.log("------");
                    //     dispatch(set_stage(3));
                    //   } else {
                    //     dispatch(increment_lcd_turns());
                    //   }
                    // }

                    const updated_players = players.map((item, index) => {
                      if (index == selected_player) {
                        return {
                          ...item,
                          score: item.score + current_streak,
                          turns: item.turns + 1,
                        };
                      } else {
                        return item;
                      }
                    });

                    dispatch(set_players(updated_players));
                    if (played_count < players.length) {
                      dispatch(set_selected_player(selected_player + 1));
                      dispatch(set_time_left(default_time));
                      dispatch(reset_current());
                    } else {
                      var tmp = [...updated_players];
                      tmp.sort(function compare(a, b) {
                        if (a.score < b.score) {
                          return 1;
                        }
                        if (a.score > b.score) {
                          return -1;
                        }
                        return 0;
                      });
                      dispatch(set_scoreboard(tmp));
                      // console.log(tmp);
                      dispatch(set_stage(3));
                    }
                  }}
                >
                  <View
                    style={{
                      // backgroundColor: "blue",
                      height: screenWidth * 0.2,
                      width: screenWidth * 0.9,
                      justifyContent: "center",
                    }}
                  >
                    <Text black xlarge center color={"black"}>
                      {played_count < players.length
                        ? `Pass to ${
                            players[(selected_player + 2) % players.length].name
                          }`
                        : "Continue"}
                    </Text>
                  </View>
                </Button>
              </View>
            </Container>
          </Shadow>
        </Container>
      );
    } else {
      return (
        <Container>
          <Shadow
            startColor={"#0002"}
            offset={[0, controllerWidth_px * 0.025]}
            distance={controllerWidth_px * 0.1}
          >
            <Container inner={true}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  paddingLeft: screenWidth * 0.05,
                  paddingRight: screenWidth * 0.05,
                  alignItems: "center",
                }}
              >
                <Button
                  onPress={() => {
                    // dispatch(set_time_left(20));
                    // dispatch(set_playing(false));
                  }}
                >
                  <View
                    style={{
                      // top: screenWidth * 0.02,
                      height: controllerHeight_px,
                      width: screenWidth * 0.22,
                      alignItems: "center",
                      justifyContent: "center",
                      // backgroundColor: "blue",
                    }}
                  >
                    <Text black title center color={"black"}>
                      {`${Math.floor(time_left / 60)}:${(
                        "0" +
                        (time_left - Math.floor(time_left / 60) * 60)
                      ).slice(-2)}`}
                    </Text>
                  </View>
                  <View style={{ top: screenWidth * -0.055 }}>
                    <Text black medium center color={"black"}>
                      Time
                    </Text>
                  </View>
                </Button>
                <Button active={false}>
                  <View
                    style={{
                      // top: screenWidth * 0.02,
                      height: screenWidth * 0.18,
                      width: screenWidth * 0.18,
                      alignItems: "center",
                      justifyContent: "center",
                      // backgroundColor: "blue",w
                    }}
                  >
                    <Text black title center color={"black"}>
                      {current_streak}
                    </Text>
                  </View>
                  <View style={{ top: screenWidth * -0.04 }}>
                    <Text black medium center color={"black"}>
                      Score
                    </Text>
                  </View>
                </Button>
                <Button
                  onPress={() => {
                    if (playing) {
                      dispatch(delete_card());
                    }
                  }}
                >
                  <View
                    style={{
                      height: screenWidth * 0.18,
                      width: screenWidth * 0.18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome5
                      name={"angle-double-right"}
                      size={screenWidth * 0.09}
                      color={playing ? "black" : "#888"}
                    />
                  </View>
                  <View style={{ top: screenWidth * -0.04 }}>
                    <Text
                      black
                      medium
                      center
                      color={playing ? "black" : "#888"}
                    >
                      Skip
                    </Text>
                  </View>
                </Button>
                <Button
                  onPress={() => {
                    if (!playing) {
                      dispatch(set_playing(true));
                    } else {
                      dispatch(delete_card());
                      dispatch(increment_current());
                    }
                  }}
                >
                  <View
                    style={{
                      height: screenWidth * 0.18,
                      width: screenWidth * 0.18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome5
                      name={playing ? "check" : "play"}
                      size={screenWidth * 0.06}
                      color="black"
                    />
                  </View>
                  <View style={{ top: screenWidth * -0.04 }}>
                    <Text black medium center color={"black"}>
                      {playing ? "Next" : "Start"}
                    </Text>
                  </View>
                </Button>
              </View>
            </Container>
          </Shadow>
        </Container>
      );
    }
  } else if (stage == 3) {
    return (
      <Container>
        <Shadow
          startColor={"#0002"}
          offset={[0, controllerWidth_px * 0.025]}
          distance={controllerWidth_px * 0.1}
        >
          <Container inner={true}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                paddingLeft: screenWidth * 0.05,
                paddingRight: screenWidth * 0.05,
                alignItems: "center",
              }}
            >
              <Button
                onPress={() => {
                  var tmp = [...playable_deck];
                  // console.log(tmp);
                  for (var i = 0; i < playable_deck.length; i++) {
                    if (tmp[i] == undefined) {
                      continue;
                    }
                    if (
                      !tmp[i]["card"].includes(
                        scoreboard[scoreboard.length - 1].id
                      )
                    ) {
                      tmp.splice(i, 1);
                    }
                  }
                  dispatch(set_playable_deck(tmp));
                  dispatch(set_selected_player(players.length - 1));
                  dispatch(set_stage(4));
                  dispatch(set_time_left(default_time));
                  dispatch(reset_current());
                  dispatch(set_played_count(0));
                }}
              >
                <View
                  style={{
                    // backgroundColor: "blue",
                    height: screenWidth * 0.2,
                    width: screenWidth * 0.9,
                    justifyContent: "center",
                  }}
                >
                  <Text black xlarge center color={"black"}>
                    {"Start"}
                  </Text>
                </View>
              </Button>
            </View>
          </Container>
        </Shadow>
      </Container>
    );
  } else if (stage == 4) {
    if (playing ? null : time_left == 0) {
      return (
        <Container>
          <Shadow
            startColor={"#0002"}
            offset={[0, controllerWidth_px * 0.025]}
            distance={controllerWidth_px * 0.1}
          >
            <Container inner={true}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  paddingLeft: screenWidth * 0.05,
                  paddingRight: screenWidth * 0.05,
                  alignItems: "center",
                }}
              >
                <Button
                  active={selected_player != undefined}
                  onPress={() => {
                    // Check if should update LCD

                    // if (
                    //   !players
                    //     .map((item, index) => {
                    //       if (index == selected_player) {
                    //         return {
                    //           ...item,
                    //           score: item.score + current_streak,
                    //           turns: item.turns + 1,
                    //         };
                    //       } else {
                    //         return item;
                    //       }
                    //     })
                    //     .some((item) => item.turns == lcd_turns)
                    // ) {
                    //   if (lcd_turns == max_rounds - 1) {
                    //     let winners = [];
                    //     let max_score = 0;
                    //     players.forEach((player, index) => {
                    //       let score =
                    //         player.score +
                    //         (index == selected_player ? current_streak : 0);
                    //       console.log("------");
                    //       console.log("Evaluating", player.name);
                    //       console.log(player);
                    //       console.log("Current Max", max_score);
                    //       if (score > max_score) {
                    //         console.log(
                    //           "My score of",
                    //           score,
                    //           "is greater than the last max of",
                    //           max_score
                    //         );
                    //         max_score = score;
                    //         winners = [player];
                    //       } else if (score == max_score) {
                    //         console.log(
                    //           "My score of",
                    //           score,
                    //           "is equal to the last max of",
                    //           max_score
                    //         );
                    //         winners.push(player);
                    //       } else {
                    //         console.log(
                    //           "My score of",
                    //           score,
                    //           "is neither equal or greater thanthe last max of",
                    //           max_score
                    //         );
                    //       }
                    //     });
                    //     console.log("GO TO WINNERS SCREEN");
                    //     console.log("Winners:", winners);
                    //     console.log("Score:", max_score);
                    //     console.log("------");
                    //     dispatch(set_stage(3));
                    //   } else {
                    //     dispatch(increment_lcd_turns());
                    //   }
                    // }

                    const updated_players = players.map((item, index) => {
                      if (index == selected_player) {
                        return {
                          ...item,
                          score: item.score + current_streak,
                        };
                      } else {
                        return item;
                      }
                    });

                    dispatch(set_players(updated_players));
                    // dispatch(set_stage(1));
                    if (played_count < players.length) {
                      dispatch(
                        set_selected_player(
                          (selected_player + players.length - 1) %
                            players.length
                        )
                      );
                      dispatch(set_time_left(default_time));
                      dispatch(reset_current());
                    } else {
                      var tmp = [...updated_players];
                      tmp.sort(function compare(a, b) {
                        if (a.score < b.score) {
                          return 1;
                        }
                        if (a.score > b.score) {
                          return -1;
                        }
                        return 0;
                      });
                      dispatch(set_scoreboard(tmp));
                      // console.log(tmp);
                      dispatch(set_stage(5));
                    }
                  }}
                >
                  <View
                    style={{
                      // backgroundColor: "blue",
                      height: screenWidth * 0.2,
                      width: screenWidth * 0.9,
                      justifyContent: "center",
                    }}
                  >
                    <Text black xlarge center color={"black"}>
                      {played_count < players.length
                        ? `Pass to ${
                            players[
                              (selected_player + players.length - 2) %
                                players.length
                            ].name
                          }`
                        : "Continue"}
                    </Text>
                  </View>
                </Button>
              </View>
            </Container>
          </Shadow>
        </Container>
      );
    } else {
      return (
        <Container>
          <Shadow
            startColor={"#0002"}
            offset={[0, controllerWidth_px * 0.025]}
            distance={controllerWidth_px * 0.1}
          >
            <Container inner={true}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  paddingLeft: screenWidth * 0.05,
                  paddingRight: screenWidth * 0.05,
                  alignItems: "center",
                }}
              >
                <Button
                  onPress={() => {
                    // dispatch(set_time_left(20));
                    // dispatch(set_playing(false));
                  }}
                >
                  <View
                    style={{
                      // top: screenWidth * 0.02,
                      height: controllerHeight_px,
                      width: screenWidth * 0.22,
                      alignItems: "center",
                      justifyContent: "center",
                      // backgroundColor: "blue",
                    }}
                  >
                    <Text black title center color={"black"}>
                      {`${Math.floor(time_left / 60)}:${(
                        "0" +
                        (time_left - Math.floor(time_left / 60) * 60)
                      ).slice(-2)}`}
                    </Text>
                  </View>
                  <View style={{ top: screenWidth * -0.055 }}>
                    <Text black medium center color={"black"}>
                      Time
                    </Text>
                  </View>
                </Button>
                <Button active={false}>
                  <View
                    style={{
                      // top: screenWidth * 0.02,
                      height: screenWidth * 0.18,
                      width: screenWidth * 0.18,
                      alignItems: "center",
                      justifyContent: "center",
                      // backgroundColor: "blue",w
                    }}
                  >
                    <Text black title center color={"black"}>
                      {current_streak}
                    </Text>
                  </View>
                  <View style={{ top: screenWidth * -0.04 }}>
                    <Text black medium center color={"black"}>
                      Score
                    </Text>
                  </View>
                </Button>
                <Button
                  onPress={() => {
                    if (playing) {
                      dispatch(delete_card());
                    }
                  }}
                >
                  <View
                    style={{
                      height: screenWidth * 0.18,
                      width: screenWidth * 0.18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome5
                      name={"angle-double-right"}
                      size={screenWidth * 0.09}
                      color={playing ? "black" : "#888"}
                    />
                  </View>
                  <View style={{ top: screenWidth * -0.04 }}>
                    <Text
                      black
                      medium
                      center
                      color={playing ? "black" : "#888"}
                    >
                      Skip
                    </Text>
                  </View>
                </Button>
                <Button
                  onPress={() => {
                    if (!playing) {
                      dispatch(set_playing(true));
                    } else {
                      dispatch(delete_card());
                      dispatch(increment_current());
                      dispatch(increment_current());
                    }
                  }}
                >
                  <View
                    style={{
                      height: screenWidth * 0.18,
                      width: screenWidth * 0.18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome5
                      name={playing ? "check" : "play"}
                      size={screenWidth * 0.06}
                      color="black"
                    />
                  </View>
                  <View style={{ top: screenWidth * -0.04 }}>
                    <Text black medium center color={"black"}>
                      {playing ? "Next" : "Start"}
                    </Text>
                  </View>
                </Button>
              </View>
            </Container>
          </Shadow>
        </Container>
      );
    }
  } else if (stage == 5) {
    return (
      <Container>
        <Shadow
          startColor={"#0002"}
          offset={[0, controllerWidth_px * 0.025]}
          distance={controllerWidth_px * 0.1}
        >
          <Container inner={true}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                paddingLeft: screenWidth * 0.05,
                paddingRight: screenWidth * 0.05,
                alignItems: "center",
              }}
            >
              <Button
                onPress={() => {
                  let tmpDeck = [];
                  let addedDecks = [];
                  for (
                    let j = 0;
                    j < scoreboard[scoreboard.length - 1].decks.length;
                    j++
                  ) {
                    for (
                      let k = 0;
                      k <
                      deck_manifest[scoreboard[scoreboard.length - 1].decks[j]]
                        .contents.contents.length;
                      k++
                    ) {
                      tmpDeck.push({
                        card: deck_manifest[
                          scoreboard[scoreboard.length - 1].decks[j]
                        ].contents.contents[k],
                        player: [],
                      });
                    }
                  }
                  dispatch(set_playable_deck(tmpDeck));

                  dispatch(set_selected_player(players.length - 1));
                  dispatch(set_stage(6));
                  dispatch(set_time_left(default_time));
                  dispatch(reset_current());
                  dispatch(set_played_count(0));
                }}
              >
                <View
                  style={{
                    // backgroundColor: "blue",
                    height: screenWidth * 0.2,
                    width: screenWidth * 0.9,
                    justifyContent: "center",
                  }}
                >
                  <Text black xlarge center color={"black"}>
                    {"Start"}
                  </Text>
                </View>
              </Button>
            </View>
          </Container>
        </Shadow>
      </Container>
    );
  } else if (stage == 6) {
    if (playing ? null : time_left == 0) {
      return (
        <Container>
          <Shadow
            startColor={"#0002"}
            offset={[0, controllerWidth_px * 0.025]}
            distance={controllerWidth_px * 0.1}
          >
            <Container inner={true}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  paddingLeft: screenWidth * 0.05,
                  paddingRight: screenWidth * 0.05,
                  alignItems: "center",
                }}
              >
                <Button
                  active={selected_player != undefined}
                  onPress={() => {
                    // Check if should update LCD

                    // if (
                    //   !players
                    //     .map((item, index) => {
                    //       if (index == selected_player) {
                    //         return {
                    //           ...item,
                    //           score: item.score + current_streak,
                    //           turns: item.turns + 1,
                    //         };
                    //       } else {
                    //         return item;
                    //       }
                    //     })
                    //     .some((item) => item.turns == lcd_turns)
                    // ) {
                    //   if (lcd_turns == max_rounds - 1) {
                    //     let winners = [];
                    //     let max_score = 0;
                    //     players.forEach((player, index) => {
                    //       let score =
                    //         player.score +
                    //         (index == selected_player ? current_streak : 0);
                    //       console.log("------");
                    //       console.log("Evaluating", player.name);
                    //       console.log(player);
                    //       console.log("Current Max", max_score);
                    //       if (score > max_score) {
                    //         console.log(
                    //           "My score of",
                    //           score,
                    //           "is greater than the last max of",
                    //           max_score
                    //         );
                    //         max_score = score;
                    //         winners = [player];
                    //       } else if (score == max_score) {
                    //         console.log(
                    //           "My score of",
                    //           score,
                    //           "is equal to the last max of",
                    //           max_score
                    //         );
                    //         winners.push(player);
                    //       } else {
                    //         console.log(
                    //           "My score of",
                    //           score,
                    //           "is neither equal or greater thanthe last max of",
                    //           max_score
                    //         );
                    //       }
                    //     });
                    //     console.log("GO TO WINNERS SCREEN");
                    //     console.log("Winners:", winners);
                    //     console.log("Score:", max_score);
                    //     console.log("------");
                    //     dispatch(set_stage(3));
                    //   } else {
                    //     dispatch(increment_lcd_turns());
                    //   }
                    // }

                    const updated_players = players.map((item, index) => {
                      if (index == selected_player) {
                        return {
                          ...item,
                          score: item.score + current_streak,
                        };
                      } else {
                        return item;
                      }
                    });

                    dispatch(set_players(updated_players));
                    // dispatch(set_stage(1));
                    if (played_count < players.length) {
                      dispatch(
                        set_selected_player(
                          (selected_player + players.length - 1) %
                            players.length
                        )
                      );
                      dispatch(set_time_left(default_time));
                      dispatch(reset_current());
                    } else {
                      var tmp = [...updated_players];
                      tmp.sort(function compare(a, b) {
                        if (a.score < b.score) {
                          return 1;
                        }
                        if (a.score > b.score) {
                          return -1;
                        }
                        return 0;
                      });
                      dispatch(set_scoreboard(tmp));
                      // console.log(tmp);
                      dispatch(set_stage(7));
                    }
                  }}
                >
                  <View
                    style={{
                      // backgroundColor: "blue",
                      height: screenWidth * 0.2,
                      width: screenWidth * 0.9,
                      justifyContent: "center",
                    }}
                  >
                    <Text black xlarge center color={"black"}>
                      {played_count < players.length
                        ? `Pass to ${
                            players[
                              (selected_player + players.length - 2) %
                                players.length
                            ].name
                          }`
                        : "Continue"}
                    </Text>
                  </View>
                </Button>
              </View>
            </Container>
          </Shadow>
        </Container>
      );
    } else {
      return (
        <Container>
          <Shadow
            startColor={"#0002"}
            offset={[0, controllerWidth_px * 0.025]}
            distance={controllerWidth_px * 0.1}
          >
            <Container inner={true}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  paddingLeft: screenWidth * 0.05,
                  paddingRight: screenWidth * 0.05,
                  alignItems: "center",
                }}
              >
                <Button
                  onPress={() => {
                    // dispatch(set_time_left(20));
                    // dispatch(set_playing(false));
                  }}
                >
                  <View
                    style={{
                      // top: screenWidth * 0.02,
                      height: controllerHeight_px,
                      width: screenWidth * 0.22,
                      alignItems: "center",
                      justifyContent: "center",
                      // backgroundColor: "blue",
                    }}
                  >
                    <Text black title center color={"black"}>
                      {`${Math.floor(time_left / 60)}:${(
                        "0" +
                        (time_left - Math.floor(time_left / 60) * 60)
                      ).slice(-2)}`}
                    </Text>
                  </View>
                  <View style={{ top: screenWidth * -0.055 }}>
                    <Text black medium center color={"black"}>
                      Time
                    </Text>
                  </View>
                </Button>
                <Button active={false}>
                  <View
                    style={{
                      // top: screenWidth * 0.02,
                      height: screenWidth * 0.18,
                      width: screenWidth * 0.18,
                      alignItems: "center",
                      justifyContent: "center",
                      // backgroundColor: "blue",w
                    }}
                  >
                    <Text black title center color={"black"}>
                      {current_streak}
                    </Text>
                  </View>
                  <View style={{ top: screenWidth * -0.04 }}>
                    <Text black medium center color={"black"}>
                      Score
                    </Text>
                  </View>
                </Button>
                {/* <Button onPress={() => {}}>
                  <View
                    style={{
                      height: screenWidth * 0.18,
                      width: screenWidth * 0.18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome5
                      name={"angle-double-right"}
                      size={screenWidth * 0.09}
                      color="black"
                    />
                  </View>
                  <View style={{ top: screenWidth * -0.04 }}>
                    <Text black medium center color={"black"}>
                      Skip
                    </Text>
                  </View>
                </Button> */}
                <Button
                  onPress={() => {
                    if (!playing) {
                      dispatch(set_playing(true));
                    } else {
                      // dispatch(delete_card());
                      dispatch(increment_current());
                      dispatch(increment_current());
                      dispatch(increment_current());
                    }
                  }}
                >
                  <View
                    style={{
                      height: screenWidth * 0.18,
                      width: screenWidth * 0.18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome5
                      name={playing ? "plus" : "play"}
                      size={screenWidth * 0.06}
                      color="black"
                    />
                  </View>
                  <View style={{ top: screenWidth * -0.04 }}>
                    <Text black medium center color={"black"}>
                      {playing ? "Add Point" : "Start"}
                    </Text>
                  </View>
                </Button>
              </View>
            </Container>
          </Shadow>
        </Container>
      );
    }
  } else if (stage == 7) {
    return (
      <Container>
        <Shadow
          startColor={"#0002"}
          offset={[0, controllerWidth_px * 0.025]}
          distance={controllerWidth_px * 0.1}
        >
          <Container inner={true}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                paddingLeft: screenWidth * 0.05,
                paddingRight: screenWidth * 0.05,
                alignItems: "center",
              }}
            >
              <Button
                onPress={() => {
                  dispatch(set_stage(0));
                  dispatch(reset_current());
                  dispatch(set_played_count(0));
                }}
              >
                <View
                  style={{
                    // backgroundColor: "blue",
                    height: screenWidth * 0.2,
                    width: screenWidth * 0.6,
                    justifyContent: "center",
                  }}
                >
                  <Text black xlarge center color={"black"}>
                    {"Play Again"}
                  </Text>
                </View>
              </Button>
            </View>
          </Container>
        </Shadow>
      </Container>
    );
  }
};

const Container = styled.View`
  align-self: center;
  margin-bottom: ${(props) => (props.inner ? 0 : bottom_margin)}px;
  width: ${controllerWidth_px}px;
  height: ${controllerHeight_px}px;
  background-color: ${(props) => (props.inner ? "white" : "#0000")}
  border-radius: ${controllerWidth_px * 0.04}px;
  justify-content: center
`;
