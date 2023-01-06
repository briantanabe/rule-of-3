import React, { useState, useEffect, useRef } from "react";
import {
  Dimensions,
  Animated,
  View,
  PanResponder,
  Easing,
  Modal,
  Pressable,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import { Shadow } from "react-native-shadow-2";
import styled from "styled-components";
import Text from "../components/Text";
import Card from "../components/Card";
import Button from "../components/Button";
import Controller from "../components/Controller";
import firebase from "../helpers/config";
import { updateDecks, getDecks } from "../helpers/decks";
import type { RootState } from "../redux/store";
import { useSelector, useDispatch } from "react-redux";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  increment_current,
  reset_current,
  set_best,
  set_playing,
  set_turn_over,
  set_stage,
  set_adding_player,
  set_players,
  set_selected_player,
} from "../redux/reducers/streak";

const possibleIcons = [
  "star",
  "spider",
  "snowman",
  "plane",
  "pizza-slice",
  "paw",
  "peace",
  "hat-cowboy",
  "hard-hat",
  "ghost",
  "frog",
  "football-ball",
];

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

export default Home = () => {
  const dispatch = useDispatch();
  const current_streak = useSelector((state) => state.streak.current_streak);
  const selectedPlayer = useSelector((state) => state.streak.selected_player);
  const adding_player = useSelector((state) => state.streak.adding_player);
  const players = useSelector((state) => state.streak.players);
  const time_left = useSelector((state) => state.streak.time_left);
  const stage = useSelector((state) => state.streak.stage);
  const playing = useSelector((state) => state.streak.playing);
  const turn_over = useSelector((state) => state.streak.turn_over);
  const testRef = firebase.firestore().collection("decks");
  const screenFlash = useRef(new Animated.Value(0)).current;
  const [deck, setDeck] = useState([]);
  const [deckLoaded, setDeckLoaded] = useState(false);
  const [currentRand, setCurrentRand] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [iconSelection, setIconSelection] = useState(null);
  const [colorSelection, setColorSelection] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(undefined);
  // const [selectedPlayer, setSelectedPLayer] = useState(undefined);
  const [nameInput, setNameInput] = useState("");

  const nameRef = useRef();
  // const [modalVisible, setModalVisible] = useState(false);

  loadDecks = async () => {
    await updateDecks();
    const deck = await getDecks();
    setDeck(deck);
    setDeckLoaded(true);
  };

  React.useEffect(() => {
    loadDecks();
  }, []);

  React.useEffect(() => {
    if (turn_over) {
      flashScreen();
    }
  }, [turn_over]);

  React.useEffect(() => {
    if (adding_player) {
      setCurrentRand(Math.random());
      setCurrentOffset(0);
      setIconSelection(null);
      setColorSelection(null);
      setNameInput("");
    }

    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, [adding_player, editingPlayer]);

  React.useEffect(() => {
    if (editingPlayer != undefined) {
      setIconSelection(players[editingPlayer].icon);
      setColorSelection(players[editingPlayer].color);
      setNameInput(players[editingPlayer].name);
    }
  }, [editingPlayer]);

  const [cards, setCards] = useState([
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random(),
  ]);
  const [cardToDelete, setCardToDelete] = useState(null);

  React.useEffect(() => {
    if (cardToDelete) {
      // dispatch(set_playing(false));
      deleteCard(cardToDelete);
      setCardToDelete(null);
    }
  }, [cardToDelete]);

  const deleteCard = (id) => {
    let tmp = [...cards];
    for (var i = 0; i < tmp.length; i++) {
      if (tmp[i] == id) {
        tmp.splice(i, 1);
      }
    }
    setCards([...tmp, Math.random()]);
  };

  const flashScreen = () => {
    Animated.sequence([
      Animated.timing(screenFlash, {
        toValue: 1,
        duration: 1,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.timing(screenFlash, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };
  if (stage == 0) {
    return (
      <Container>
        <Modal
          transparent={true}
          animationType={"slide"}
          visible={adding_player || editingPlayer != undefined}
        >
          <Pressable
            onPress={() => {
              dispatch(set_adding_player(false));
              setEditingPlayer(undefined);
            }}
          >
            <View
              style={{
                width: screenWidth,
                height: screenHeight,
                alignItems: "center",
                justifyContent: "flex-start",
                paddingTop: screenWidth * 0.2,
                // backgroundColor: "#000A",
              }}
            >
              <Shadow
                startColor={"#0002"}
                offset={[0, screenWidth * 0.8 * 0.025]}
                distance={screenWidth * 0.8 * 0.1}
              >
                <Button active={false}>
                  <View
                    style={{
                      width: screenWidth * 0.85,
                      alignItems: "center",
                      backgroundColor: "white",
                      borderRadius: screenWidth * 0.1,
                      paddingTop: screenWidth * 0.08,
                    }}
                  >
                    <TextInput
                      ref={nameRef}
                      onEndEditing={() => {
                        if (nameInput != "") {
                          dispatch(
                            set_players([
                              ...players,
                              {
                                name: nameInput,
                                icon: iconSelection,
                                color: colorSelection,
                                score:
                                  editingPlayer == undefined
                                    ? 0
                                    : players[editingPlayer].score,
                                turns:
                                  editingPlayer == undefined
                                    ? 0
                                    : players[editingPlayer].turns,
                              },
                            ])
                          );
                          dispatch(set_adding_player(false));
                        }
                      }}
                      maxLength={10}
                      onChangeText={setNameInput}
                      defaultValue={
                        editingPlayer != undefined
                          ? players[editingPlayer].name
                          : ""
                      }
                      placeholder={
                        editingPlayer != undefined
                          ? players[editingPlayer].name
                          : "Player Name"
                      }
                      placeholderColor={"#444"}
                      style={{
                        color: "black",
                        fontSize: screenWidth * 0.06,
                        fontFamily: "Avenir",
                        fontWeight: "700",
                      }}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: screenWidth * 0.05,
                      }}
                    >
                      {[...Array(3).keys()].map((item, index) => {
                        const remainingIcons = possibleIcons.filter(
                          (n) =>
                            !players.map((item, index) => item.icon).includes(n)
                        );
                        let icon =
                          remainingIcons[
                            (Math.floor(currentRand * remainingIcons.length) +
                              index) %
                              remainingIcons.length
                          ];
                        // if (
                        //   players.some((item) => {
                        //     if (item.icon == icon) {
                        //       return true;
                        //     } else {
                        //       return false;
                        //     }
                        //   })
                        // ) {
                        //   icon =
                        //     possibleIcons[
                        //       (1 +
                        //         currentOffset +
                        //         Math.floor(currentRand * possibleIcons.length) +
                        //         index) %
                        //         possibleIcons.length
                        //     ];
                        //   setCurrentOffset(currentOffset + 1);
                        // }
                        if (index == 0) {
                          if (editingPlayer != undefined) {
                            // console.log(
                            //   "EDITING PLAYER, SETTING ICON TO:",
                            //   players[editingPlayer].icon
                            // );
                            icon = players[editingPlayer].icon;
                          }
                          if (iconSelection == null) {
                            // console.log(
                            //   "CREATING NEW PLAYER, SETTING DEFAULT SELECTION TO",
                            //   icon
                            // );
                            setIconSelection(icon);
                          }
                        }
                        console.log("About to render icon:", icon);
                        return (
                          <Button
                            key={index}
                            onPress={() => setIconSelection(icon)}
                          >
                            <View
                              style={{
                                margin: screenWidth * 0.03,
                                marginRight: screenWidth * 0.05,
                                marginLeft: screenWidth * 0.05,
                              }}
                            >
                              <FontAwesome5
                                name={icon}
                                size={screenWidth * 0.13}
                                color={
                                  icon == iconSelection
                                    ? colorSelection
                                    : "#BBB"
                                }
                              />
                            </View>
                          </Button>
                        );
                      })}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        // marginTop: screenWidth * 0.05,
                      }}
                    >
                      {[...Array(3).keys()].map((item, index) => {
                        let color =
                          possibleColors[
                            (Math.floor(currentRand * possibleColors.length) +
                              index) %
                              possibleColors.length
                          ];
                        if (index == 0) {
                          if (editingPlayer != undefined) {
                            color = players[editingPlayer].color;
                          }
                          if (colorSelection == null) {
                            setColorSelection(color);
                          }
                        }
                        return (
                          <Button
                            key={index}
                            onPress={() => setColorSelection(color)}
                          >
                            <View
                              style={{
                                width: screenWidth * 0.14,
                                height: screenWidth * 0.14,
                                margin: screenWidth * 0.03,
                                marginRight: screenWidth * 0.048,
                                marginLeft: screenWidth * 0.048,
                                backgroundColor: color,
                                borderRadius: screenWidth * 0.03,
                                opacity: color == colorSelection ? 1 : 0.5,
                                borderWidth: color == colorSelection ? 2 : 0,
                                borderColor: "#000",
                              }}
                            />
                          </Button>
                        );
                      })}
                    </View>
                    {editingPlayer != undefined ? (
                      <View style={{ flexDirection: "row" }}>
                        <Button
                          onPress={() => {
                            let newArr = [];
                            for (let i = 0; i < players.length; i++) {
                              if (i != editingPlayer) {
                                newArr.push(players[i]);
                              }
                            }
                            dispatch(set_players(newArr));
                            setEditingPlayer(undefined);
                          }}
                        >
                          <View
                            style={{
                              width: screenWidth * 0.3,
                              height: screenWidth * 0.13,
                              margin: screenWidth * 0.07,
                              backgroundColor: "#F17171",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: screenWidth * 0.04,
                              // opacity: nameInput == "" ? 0.3 : 1,
                              marginRight: screenWidth * 0.03,
                            }}
                          >
                            <Text black large color="white">
                              Remove
                            </Text>
                          </View>
                        </Button>

                        <Button
                          active={nameInput != ""}
                          onPress={() => {
                            let newArr = [];
                            for (let i = 0; i < players.length; i++) {
                              if (i != editingPlayer) {
                                newArr.push(players[i]);
                              } else {
                                newArr.push({
                                  name: nameInput,
                                  icon: iconSelection,
                                  color: colorSelection,
                                  score: players[i].score,
                                  turns: players[i].turns,
                                });
                              }
                            }
                            // console.log(newArr);
                            dispatch(set_players(newArr));
                            setEditingPlayer(undefined);
                          }}
                        >
                          <View
                            style={{
                              width: screenWidth * 0.3,
                              height: screenWidth * 0.13,
                              margin: screenWidth * 0.07,
                              backgroundColor: "#39A559",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: screenWidth * 0.04,
                              opacity: nameInput == "" ? 0.3 : 1,
                              marginLeft: screenWidth * 0.03,
                            }}
                          >
                            <Text black large color="white">
                              Save
                            </Text>
                          </View>
                        </Button>
                      </View>
                    ) : (
                      <Button
                        active={nameInput != ""}
                        onPress={() => {
                          console.log(nameInput);
                          console.log(nameInput != "");
                          dispatch(
                            set_players([
                              ...players,
                              {
                                name: nameInput,
                                icon: iconSelection,
                                color: colorSelection,
                                score: 0,
                                turns: 0,
                              },
                            ])
                          );
                          dispatch(set_adding_player(false));
                        }}
                      >
                        <View
                          style={{
                            width: screenWidth * 0.4,
                            height: screenWidth * 0.13,
                            margin: screenWidth * 0.07,
                            backgroundColor: "#39A559",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: screenWidth * 0.04,
                            opacity: nameInput != "" ? 1 : 0.3,
                          }}
                        >
                          <Text black large color="white">
                            Create
                          </Text>
                        </View>
                      </Button>
                    )}
                  </View>
                </Button>
              </Shadow>
            </View>
          </Pressable>
        </Modal>
        <View
          style={{
            position: "absolute",
            width: screenWidth,
            height: screenHeight,
            paddingTop: screenWidth * 0.25,
            alignItems: "center",
            backgroundColor:
              adding_player || editingPlayer != undefined ? "#000A" : "#0000",
          }}
        >
          <Text xlarge center black color={"black"}>
            Add Players
          </Text>
          <View
            style={{
              marginTop: screenWidth * 0.02,
              width: screenWidth * 0.7,
            }}
          >
            <Text large center bold color={"#444"}>
              You need at least 4 to play!
            </Text>
          </View>
          <View
            style={{
              paddingTop: screenWidth * 0.13,
              width: screenWidth * 0.96,
              // height: screenHeight * 0.5,
              // backgroundColor: "red",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {[...Array(12).keys()].map((item, index) => {
              if (index < players.length) {
                return (
                  <Button
                    key={index}
                    onPress={() => {
                      // console.log("edit", index);
                      setEditingPlayer(index);
                    }}
                  >
                    <View
                      style={{
                        margin: screenWidth * 0.025,
                        marginTop: 0,
                        marginBottom: screenWidth * 0.07,
                        width: screenWidth * 0.24,
                        height: screenWidth * 0.22,
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <FontAwesome5
                        name={players[index].icon}
                        size={screenWidth * 0.13}
                        color={players[index].color}
                      />
                      <Text color={"#555"} black large>
                        {players[index].name}
                      </Text>
                    </View>
                  </Button>
                );
              } else {
                return (
                  <Button
                    key={index}
                    onPress={() => {
                      // console.log("Adding");
                      dispatch(set_adding_player(true));
                    }}
                  >
                    <View
                      key={index}
                      style={{
                        margin: screenWidth * 0.025,
                        marginTop: 0,
                        marginBottom: screenWidth * 0.07,
                        width: screenWidth * 0.24,
                        height: screenWidth * 0.22,
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="person"
                        size={screenWidth * 0.13}
                        color="#0004"
                      />
                      <Text color="#0004" black large>
                        Empty
                      </Text>
                    </View>
                  </Button>
                );
              }
            })}
          </View>
        </View>
      </Container>
    );
  } else if (stage == 1) {
    return (
      <Container>
        <View
          style={{
            position: "absolute",
            width: screenWidth,
            height: screenHeight,
            paddingTop: screenWidth * 0.2,
            alignItems: "center",
            backgroundColor:
              adding_player || editingPlayer != undefined ? "#000A" : "#0000",
          }}
        >
          <Text xlarge center black color={"black"}>
            Round 1
          </Text>
          <View
            style={{
              marginTop: screenWidth * 0.02,
              width: screenWidth * 0.8,
              paddingBottom: screenWidth * 0.04,
            }}
          >
            <Text large center bold color={"#444"}>
              In this round, everyone gets a chance to score as high as they
              can!
            </Text>
          </View>
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingBottom: screenWidth * 0.35,
            }}
          >
            {players.some((item) => item.turns == 0) ? (
              <View
                style={{
                  height: screenWidth * 0.065,
                  width: screenWidth,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    // marginTop: screenWidth * 0.03,
                    // marginBottom: screenWidth * 0.03,
                    position: "absolute",
                    height: screenWidth * 0.002,
                    width: screenWidth * 0.85,
                    backgroundColor: "#444",
                  }}
                />
                <View
                  style={{
                    padding: screenWidth * 0.02,
                    paddingTop: 0,
                    paddingBottom: 0,
                    backgroundColor: "#FFF",
                  }}
                >
                  <Text medium heavy color={"#444"}>
                    Players Left
                  </Text>
                </View>
              </View>
            ) : null}
            <View
              style={{
                width: screenWidth * 0.9,
                alignItems: "flex-start",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              {[...Array(12).keys()].map((item, index) => {
                if (index < players.length && players[item].turns == 0) {
                  return (
                    <Button
                      key={index}
                      onPress={() => {
                        dispatch(set_selected_player(index));
                        // console.log("edit", index);
                        // setEditingPlayer(index);
                      }}
                    >
                      <View
                        style={{
                          margin: screenWidth * 0.015,
                          // height: screenWidth * 0.22,
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexDirection: "row",
                          width: screenWidth * 0.87,
                          borderWidth: 2,
                          borderRadius: screenWidth * 0.05,
                          padding: screenWidth * 0.02,
                          paddingRight: screenWidth * 0.05,
                          paddingLeft: screenWidth * 0.05,
                          borderColor:
                            selectedPlayer == index ? "#000" : "#0000",
                        }}
                      >
                        <View
                          style={{
                            width: screenWidth * 0.13,
                            height: screenWidth * 0.13,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FontAwesome5
                            name={players[index].icon}
                            size={screenWidth * 0.1}
                            color={players[index].color}
                          />
                        </View>
                        <View
                          style={{
                            width: screenWidth * 0.45,
                            height: screenWidth * 0.1,
                            alignItems: "center",
                            justifyContent: "center",
                            // marginRight: screenWidth * 0.02,
                            // marginBottom: screenWidth * 0.02,
                            // backgroundColor: "red",
                          }}
                        >
                          <Text color={"#555"} black xlarge>
                            {players[index].name}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: screenWidth * 0.13,
                            height: screenWidth * 0.13,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text color={"#555"} black mt>
                            {players[index].score}
                          </Text>
                        </View>
                      </View>
                    </Button>
                  );
                }
              })}
            </View>
            {players.some((item) => item.turns > 0) ? (
              <View
                style={{
                  height: screenWidth * 0.065,
                  width: screenWidth,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    // marginTop: screenWidth * 0.03,
                    // marginBottom: screenWidth * 0.03,
                    position: "absolute",
                    height: screenWidth * 0.002,
                    width: screenWidth * 0.85,
                    backgroundColor: "#444",
                  }}
                />
                <View
                  style={{
                    padding: screenWidth * 0.02,
                    paddingTop: 0,
                    paddingBottom: 0,
                    backgroundColor: "#FFF",
                  }}
                >
                  <Text medium heavy color={"#444"}>
                    Already Gone
                  </Text>
                </View>
              </View>
            ) : null}

            <View
              style={{
                width: screenWidth * 0.9,
                alignItems: "flex-start",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              {[...Array(12).keys()].map((item, index) => {
                if (index < players.length && players[item].turns > 0) {
                  return (
                    <View
                      key={index}
                      style={{
                        margin: screenWidth * 0.015,
                        // height: screenWidth * 0.22,
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexDirection: "row",
                        width: screenWidth * 0.87,
                        padding: screenWidth * 0.02,
                        paddingRight: screenWidth * 0.05,
                        paddingLeft: screenWidth * 0.05,
                      }}
                    >
                      <View
                        style={{
                          width: screenWidth * 0.13,
                          height: screenWidth * 0.13,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FontAwesome5
                          name={players[index].icon}
                          size={screenWidth * 0.1}
                          color={players[index].color}
                        />
                      </View>
                      <View
                        style={{
                          width: screenWidth * 0.45,
                          height: screenWidth * 0.1,
                          alignItems: "center",
                          justifyContent: "center",
                          // marginRight: screenWidth * 0.02,
                          // marginBottom: screenWidth * 0.02,
                          // backgroundColor: "red",
                        }}
                      >
                        <Text color={"#555"} black xlarge>
                          {players[index].name}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: screenWidth * 0.13,
                          height: screenWidth * 0.13,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text color={"#555"} black mt>
                          {players[index].score}
                        </Text>
                      </View>
                    </View>
                  );
                }
              })}
            </View>
          </ScrollView>
        </View>
        {/* <Button onPress={() => dispatch(set_stage(0))}>
          <View
            style={{
              position: "absolute",
              margin: 20,
              marginTop: 40,
              padding: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesome5
              name={"magic"}
              size={screenWidth * 0.09}
              color="black"
            />
          </View>
        </Button> */}
      </Container>
    );
  } else if (stage == 2) {
    return (
      <Container>
        {deckLoaded ? (
          <View>
            <Animated.View
              style={{
                position: "absolute",
                backgroundColor: "#f55",
                width: screenWidth,
                height: screenHeight,
                opacity: screenFlash.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              }}
            />
            {cards.map((item, index) => {
              return (
                <Card
                  key={`${item}`}
                  id={item}
                  index={index}
                  time={6}
                  deletionCallback={setCardToDelete}
                  // lossCallback={lossCallback}
                  noun={deck[Math.floor(item * deck.length)].n}
                  rule={deck[Math.floor(item * deck.length)].r}
                />
              );
            })}
          </View>
        ) : null}
        {playing ? null : time_left == 0 ? (
          <View
            style={{
              position: "absolute",
              pointerEvents: "none",
              marginTop: screenHeight * 0.45,
              width: screenWidth,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#499F68",
                paddingTop: screenWidth * 0.09,
                paddingLeft: screenWidth * 0.1,
                paddingRight: screenWidth * 0.1,
                paddingBottom: screenWidth * 0.09,
                borderRadius: screenWidth * 0.04,
                alignItems: "center",
              }}
            >
              <Text center large black color={"white"}>
                {`${players[selectedPlayer].name} got:`}
              </Text>
              <View
                style={{
                  marginTop: screenWidth * 0.05,
                  width: screenWidth * 0.6,
                }}
              >
                <Text center giant black color={"white"}>
                  {`${current_streak} points!`}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{
              position: "absolute",
              pointerEvents: "none",
              marginTop: screenHeight * 0.52,
              width: screenWidth,
              alignItems: "center",
              justifyContent: "center",
              // backgroundColor: "red",
            }}
          >
            <View
              style={{
                width: screenWidth * 0.7,
              }}
            >
              <Text center xlarge bold color={"black"}>
                {`${players[selectedPlayer].name} is up!`}
              </Text>
            </View>
          </View>
        )}
      </Container>
    );
  }
};

const Container = styled.View`
  position: absolute
  height: ${screenHeight}px
  width: ${screenWidth}px
  /* flex-direction: row */
`;
