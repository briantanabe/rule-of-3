import React, { useRef, useState, useEffect, useMemo } from "react";
import { Shadow } from "react-native-shadow-2";

import {
  Dimensions,
  Animated,
  View,
  StyleSheet,
  Easing,
  PanResponder,
  TextInput,
} from "react-native";

import Foundation from "@expo/vector-icons/Foundation";

import styled from "styled-components";
import Text from "../components/Text";
import MaskedView from "@react-native-masked-view/masked-view";
import type { RootState } from "../redux/store";
import { useSelector, useDispatch } from "react-redux";
import {
  increment_current,
  reset_current,
  set_best,
  set_playing,
  set_current_card,
} from "../redux/reducers/streak";

const possibleColors = [
  "#FFE769",
  "#F17171",
  "#EEB27A",
  "#E96FC6",
  "#618BF5",
  "#7B72CD",
  "#649E62",
  "#83D2C4",
];

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const cardWidth_px = screenWidth * 0.8;
const cardHeight_px = screenWidth * 1;

const baseline_y = screenHeight - cardHeight_px - screenWidth * 0.4;
const top_y = cardHeight_px * -1;

// const cardHeight_px = screenWidth * 0.75;

// const baseline_y = screenHeight - cardHeight_px - screenWidth * 1.05;
// const top_y = cardHeight_px * -1.17;

// const shortCardHeight_px = screenWidth * 1;

const ticHeight_px = cardHeight_px * 0.06;
const ticBoundary_px = cardWidth_px * 0.8;

const swipeThresh = 0.5;

export default Card = (props) => {
  const current_card = useSelector((state) => state.streak.current_card);
  const current_streak = useSelector((state) => state.streak.current_streak);
  const players = useSelector((state) => state.streak.players);
  const playing = useSelector((state) => state.streak.playing);
  const dispatch = useDispatch();
  const pan = useRef(new Animated.ValueXY()).current;
  const percentageRemaining = useRef(new Animated.Value(1)).current;
  const wrongAnimationOpacity = useRef(new Animated.Value(0)).current;
  const wrongAnimationMove = useRef(new Animated.Value(0)).current;
  const wrongAnimationTextOpacity = useRef(new Animated.Value(0)).current;

  const calculateProgress = () => {
    return 1 - (props.index + Number(playing ? 0 : 1)) / 6;
  };

  const [card_visibility, setCard_visibility] = useState(0);
  const [progress, setProgress] = useState(calculateProgress());
  const [shown, setShown] = useState(false);

  const rule_text = props.deck
    ? props.deck[props.rule]["card"]
        .toString()
        .replace(
          "[player_name]",
          players[Math.floor(props.id * players.length)].name
        )
    : "ERROR";

  const delay = (delayInms) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
  };

  // useEffect(() => {
  //   if (props.index == 0 && !playing && shown) {
  //     triggerDeleteAnimation(true);
  //     return;
  //   }
  //   if (props.index == 0 && playing) {
  //     // What does this do this is weird
  //     if (turn_over) {
  //       dispatch(reset_current());
  //       dispatch(set_turn_over(false));
  //     }
  //   }
  //   setProgress(calculateProgress());
  //   moveTo(calculateProgress());
  // }, [props.index, playing]);

  useEffect(() => {
    if (props.index == 0) {
      dispatch(set_current_card(props.id));
      setShown(true);
    }
    setProgress(calculateProgress());
    moveTo(calculateProgress());
  }, [props.index, playing]);

  useEffect(() => {
    if (shown && props.id != current_card) {
      triggerDeleteAnimation(true);
    }
  }, [current_card]);

  const moveTo = async (p) => {
    Animated.timing(pan, {
      toValue: {
        x: 0,
        y: p >= 1 ? baseline_y : top_y + cardHeight_px * p * 0.6,
      },
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    setCard_visibility(0);
    Animated.timing(pan, {
      toValue: {
        x: 0,
        y: -cardHeight_px,
      },
      duration: 1,
      useNativeDriver: false,
    }).start(() => {
      setCard_visibility(1);
      moveTo(progress);
    });
  }, []);

  const panResponder = useMemo(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: () => {
        return progress >= 1;
      },
      onPanResponderGrant: () => {
        if (progress >= 1) {
          pan.setOffset({
            x: pan.x._value,
            y: pan.y._value,
          });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (progress >= 1) {
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: () => {
        if (progress >= 1) {
          pan.flattenOffset();
          if (
            Math.abs(pan.x._value) + Math.abs(pan.y._value - baseline_y) >
            screenWidth * swipeThresh
          ) {
            triggerDeleteAnimation();
          } else {
            Animated.timing(pan, {
              toValue: {
                x: 0,
                y: baseline_y,
              },
              easing: progress >= 1 ? Easing.linear : Easing.linear,
              duration: 70,
              useNativeDriver: false,
            }).start();
          }
        }
      },
    })
  );

  const triggerDeleteAnimation = (autoDelete = false) => {
    const x = Number(autoDelete ? 280 : pan.x._value);
    const y = Number(autoDelete ? 230 : pan.y._value);
    Animated.timing(pan, {
      toValue: {
        x: (x * 1.6) / swipeThresh,
        y: ((y - baseline_y) * 1.6) / swipeThresh,
      },
      easing: Easing.linear,
      duration: autoDelete ? 300 : 150,
      useNativeDriver: false,
    }).start(() => {
      props.deletionCallback([props.rule, props.id]);
    });
  };

  return (
    <Animated.View
      style={{
        opacity: card_visibility,
        position: "absolute",
        transform: [
          { translateX: pan.x },
          { translateY: pan.y },
          {
            rotate: pan.x.interpolate({
              inputRange: [0, screenWidth],
              outputRange: ["0deg", "35deg"],
              extrapolateLeft: "extend",
            }),
          },
        ],
      }}
      {...panResponder.panHandlers}
    >
      <Shadow
        startColor={"#00000018"}
        offset={[cardWidth_px * 0.12, 0]}
        distance={cardWidth_px * 0.08}
      >
        <Cardback id={props.id}>
          <View
            style={{
              alignSelf: "flex-start",
              alignItems: "flex-start",
              paddingTop: screenWidth * 0.05,
            }}
          >
            <RuleText>{`NAME THREE:`}</RuleText>
            <RuleText>{`${rule_text.toUpperCase()}`}</RuleText>
          </View>
          {/* <MaskedView
            style={{
              flexDirection: "row",
              margin: (cardWidth_px - ticBoundary_px) / 2,
              marginBottom: cardWidth_px * 0.2,
            }}
            maskElement={
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {[...Array(time).keys()].map((item, index) => {
                  return <ProgressTicMask time={props.time} key={index} />;
                })}
              </View>
            }
          >
            <Animated.View
              style={{
                transform: [
                  {
                    translateX: percentageRemaining.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [
                        -ticBoundary_px / 2,
                        -ticBoundary_px / 2,
                        0,
                      ],
                    }),
                  },
                ],
                flexDirection: "row",
              }}
            >
              <ProgressBar bgColor={"white"} />
              <Animated.View
                style={{
                  transform: [
                    {
                      scaleX: percentageRemaining.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [ticBoundary_px * 0.5, 1, 1],
                      }),
                    },
                    {
                      translateX: percentageRemaining.interpolate({
                        inputRange: [0, 0.25, 1, 1],
                        outputRange: [-0.5, -0.495, 0, 0],
                      }),
                    },
                  ],
                  opacity: percentageRemaining.interpolate({
                    inputRange: [0, 0.5, 0.501, 1],
                    outputRange: [1, 0.99, 0, 0],
                  }),
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    backgroundColor: "red",
                    width: 1,
                    height: ticHeight_px,
                  }}
                />
              </Animated.View>
              <Animated.View
                style={{
                  transform: [
                    {
                      scaleX: percentageRemaining.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1, ticBoundary_px * 0.5],
                      }),
                    },
                    {
                      translateX: percentageRemaining.interpolate({
                        inputRange: [0, 0, 0.5, 1],
                        outputRange: [0, 0, -0.42, -0.5],
                      }),
                    },
                  ],
                  opacity: percentageRemaining.interpolate({
                    inputRange: [0, 0.5, 0.501, 1],
                    outputRange: [0, 0, 0.99, 1],
                  }),
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    backgroundColor: "green",
                    width: 1,
                    height: ticHeight_px,
                  }}
                />
              </Animated.View>
              <ProgressBar bgColor={"#0005"} />
            </Animated.View>
          </MaskedView> */}
          {/* <View /> */}
          <Animated.View
            style={{
              opacity: wrongAnimationOpacity,
              position: "absolute",
            }}
          >
            <WrongOverlay>
              <Animated.View
                style={{
                  position: "absolute",
                  transform: [
                    {
                      scale: wrongAnimationMove.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.4],
                      }),
                    },
                    {
                      translateX: wrongAnimationMove.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -cardWidth_px],
                      }),
                    },
                    {
                      translateY: wrongAnimationMove.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -cardHeight_px],
                      }),
                    },
                  ],
                }}
              >
                <Foundation name="x" size={screenWidth * 0.25} color="white" />
              </Animated.View>
              <Animated.View
                style={{
                  opacity: wrongAnimationTextOpacity,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text title black>
                  You're out!
                  <Text giant>😭</Text>
                </Text>
                <View
                  style={{
                    marginTop: cardWidth_px * 0.05,
                    width: cardWidth_px * 0.85,
                  }}
                >
                  <Text center large black>
                    Pass the phone until the round ends
                  </Text>
                </View>
              </Animated.View>
            </WrongOverlay>
          </Animated.View>
        </Cardback>
      </Shadow>
    </Animated.View>
  );
};

const WrongOverlay = styled.View`
  width: ${cardWidth_px}px;
  height: ${cardHeight_px}px;
  background-color: #000c;
  align-items: center;
  justify-content: center;
`;

const Cardback = styled.View`
  overflow: hidden;
  background-color: ${(props) =>
    possibleColors[Math.floor(props.id * possibleColors.length)]}
  width: ${cardWidth_px}px;
  height: ${cardHeight_px}px;
  border-radius: ${screenWidth * 0.05}px;
  left: ${(screenWidth - cardWidth_px) / 2}px;
  justify-content: space-between;
`;

const RuleText = styled.Text`
  background-color: #0004;
  font-size: 32px;
  font-weight: 800;
  color: white;
  padding: ${screenWidth * 0.01}px;
  margin: ${screenWidth * 0.05}px;
  margin-bottom: ${screenWidth * 0.003}px;
  margin-top: 0px;
`;

const ProgressBar = styled.View`
  background-color: ${(props) => props.bgColor ?? "white"}
  width: ${ticBoundary_px}px
  height: ${ticHeight_px}px;
`;

const ProgressTicMask = styled.View`
  background-color: white;

  height: ${ticHeight_px}px;
  margin-bottom: ${cardWidth_px * 0.18}px;
  border-radius: ${cardWidth_px * 0.01}px;
  align-self: center;
`;
