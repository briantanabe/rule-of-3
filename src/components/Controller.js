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
  reset_current,
  set_best,
  set_playing,
  set_turn_over,
  set_time_left,
  set_adding_player,
  set_stage,
  set_players,
  set_selected_player,
} from "../redux/reducers/streak";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const controllerWidth_px = screenWidth * 0.9;
const controllerHeight_px = screenWidth * 0.2;
const bottom_margin = screenWidth * 0.09;

export default Controller = (props) => {
  const selected_player = useSelector((state) => state.streak.selected_player);
  const players = useSelector((state) => state.streak.players);
  const stage = useSelector((state) => state.streak.stage);
  const time_left = useSelector((state) => state.streak.time_left);
  const best_streak = useSelector((state) => state.streak.best_streak);
  const current_streak = useSelector((state) => state.streak.current_streak);

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
        dispatch(set_turn_over(false));
        dispatch(set_turn_over(true));
        dispatch(set_playing(false));
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
                  dispatch(set_stage(1));
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
                      Start the Game
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
                    Edit Players
                  </Text>
                </View>
              </Button>
              <Button
                active={selected_player != undefined}
                onPress={() => {
                  dispatch(set_stage(2));
                  dispatch(set_time_left(20));
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
                  <Text
                    black
                    xlarge
                    center
                    color={selected_player != undefined ? "black" : "#888"}
                  >
                    {selected_player != undefined ? "Ready" : "Select Player"}
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
                    dispatch(
                      set_players(
                        players.map((item, index) => {
                          if (index == selected_player) {
                            return {
                              ...item,
                              score: item.score + current_streak,
                              turns: item.turns + 1,
                            };
                          } else {
                            return item;
                          }
                        })
                      )
                    );
                    dispatch(set_stage(1));
                    dispatch(set_selected_player(undefined));
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
                      Continue
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
                <Button onPress={() => {}}>
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
                </Button>
                <Button
                  onPress={() => {
                    if (!playing) {
                      dispatch(set_playing(!playing));
                    } else {
                      console.log("Trigger deletion!");
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
