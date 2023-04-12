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
import { updateDecks, getDecks, test } from "../helpers/decks";
import type { RootState } from "../redux/store";
import { useSelector, useDispatch } from "react-redux";
import HsvColorPicker from "react-native-hsv-color-picker";
import {
  Ionicons,
  FontAwesome5,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  increment_current,
  reset_current,
  set_best,
  set_playing,
  set_playable_deck,
  set_turn_over,
  set_stage,
  set_default_time,
  set_adding_player,
  set_players,
  set_selected_player,
  set_deck_manifest,
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
  const lcd_turns = useSelector((state) => state.streak.lcd_turns);
  const current_streak = useSelector((state) => state.streak.current_streak);
  const selectedPlayer = useSelector((state) => state.streak.selected_player);
  const adding_player = useSelector((state) => state.streak.adding_player);
  const players = useSelector((state) => state.streak.players);
  const time_left = useSelector((state) => state.streak.time_left);
  const stage = useSelector((state) => state.streak.stage);
  const playing = useSelector((state) => state.streak.playing);
  const turn_over = useSelector((state) => state.streak.turn_over);
  const scoreboard = useSelector((state) => state.streak.scoreboard);
  const default_time = useSelector((state) => state.streak.default_time);
  const deck_manifest = useSelector((state) => state.streak.deck_manifest);
  const playable_deck = useSelector((state) => state.streak.playable_deck);
  const testRef = firebase.firestore().collection("decks");
  const screenFlash = useRef(new Animated.Value(0)).current;
  // const [deckManifest, setDeckManifest] = useState([]);
  const [deckManifestLoaded, setDeckManifestLoaded] = useState(false);
  const [currentRand, setCurrentRand] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [iconSelection, setIconSelection] = useState(null);
  const [colorSelection, setColorSelection] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(undefined);
  const [selectedDecks, setSelectedDecks] = useState([]);

  const [editingDeck, setEditingDeck] = useState(false);
  const [selectedEditingDeckID, setSelectedEditingDeckID] = useState(undefined);
  const [selectedEditingDeckVersion, setSelectedEditingDeckVersion] =
    useState(undefined);
  const [selectedEditingDeckTitle, setSelectedEditingDeckTitle] = useState("");
  const [selectedEditingDeckColor, setSelectedEditingDeckColor] = useState("");
  const [selectedEditingDeckIcon, setSelectedEditingDeckIcon] = useState("");
  const [selectedEditingDeckItems, setSelectedEditingDeckItems] = useState([]);

  const [colorState, setColorState] = useState({
    hue: 0,
    sat: 0,
    val: 1,
  });

  const onSatValPickerChange = ({ saturation, value }) => {
    setColorState({
      sat: saturation,
      val: value,
    });
  };

  const onHuePickerChange = ({ hue }) => {
    setColorState({ hue });
  };

  // const [selectedPlayer, setSelectedPLayer] = useState(undefined);
  const [nameInput, setNameInput] = useState("");

  const nameRef = useRef();
  const deckNameRef = useRef();
  // const [modalVisible, setModalVisible] = useState(false);

  loadDecks = async () => {
    const deckManifest = await updateDecks();

    // const deck = await getDecks();
    // let tmp = [...deckManifest];
    for (let i = 0; i < deckManifest.length; i++) {
      // console.log(deckManifest[i].contents);
      // tmp[i].contents = JSON.parse(deckManifest[i].contents);
    }
    dispatch(set_deck_manifest(deckManifest));
    setDeckManifestLoaded(true);
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
      deleteCard(cardToDelete[0], cardToDelete[1]);
      setCardToDelete(null);
    }
  }, [cardToDelete]);

  const deleteCard = (id, key) => {
    let tmp = [...playable_deck];
    tmp.splice(id, 1);
    dispatch(set_playable_deck(tmp));
    let tmp1 = [...cards];
    for (var i = 0; i < tmp1.length; i++) {
      if (tmp1[i] == key) {
        tmp1.splice(i, 1);
        break;
      }
    }
    setCards([...tmp1, Math.random()]);
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
              setSelectedDecks([]);
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
                      borderRadius: screenWidth * 0.07,
                      paddingTop: screenWidth * 0.08,
                    }}
                  >
                    <TextInput
                      ref={nameRef}
                      autoCapitalize={"words"}
                      onEndEditing={() => {
                        if (nameInput != "") {
                          const remainingIcons = possibleIcons.filter(
                            (n) =>
                              !players
                                .map((item, index) => item.icon)
                                .includes(n)
                          );
                          let icon =
                            remainingIcons[
                              Math.floor(currentRand * remainingIcons.length) %
                                remainingIcons.length
                            ];
                          let color =
                            possibleColors[
                              Math.floor(currentRand * possibleColors.length) %
                                possibleColors.length
                            ];
                          dispatch(
                            set_players([
                              ...players,
                              {
                                name: nameInput,
                                icon: icon,
                                color: color,
                                score:
                                  editingPlayer == undefined
                                    ? 0
                                    : players[editingPlayer].score,
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
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      {deck_manifest.map((item, index) => {
                        const contents = item.contents;
                        return (
                          <Button
                            key={index}
                            onPress={() => {
                              if (
                                selectedDecks.some((selected) => {
                                  return index == selected;
                                })
                              ) {
                                let tmp = [...selectedDecks];
                                for (var i = 0; i < selectedDecks.length; i++) {
                                  if (selectedDecks[i] == index) {
                                    tmp.splice(i, 1);
                                    break;
                                  }
                                }
                                setSelectedDecks(tmp);
                              } else {
                                setSelectedDecks([...selectedDecks, index]);
                              }
                            }}
                          >
                            <View
                              style={{
                                width: screenWidth * 0.23,
                                height: screenWidth * 0.15,
                                borderRadius: screenWidth * 0.015,
                                backgroundColor: contents.color,
                                margin: screenWidth * 0.02,
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: selectedDecks.some((selected) => {
                                  return index == selected;
                                })
                                  ? 1
                                  : 0.3,
                              }}
                            >
                              <View
                                style={{
                                  marginTop: screenWidth * 0.01,
                                  marginBottom: screenWidth * 0.01,
                                }}
                              >
                                <Ionicons
                                  name={contents.icon}
                                  size={screenWidth * 0.05}
                                  color="white"
                                />
                              </View>
                              <Text black medium color="white">
                                {contents.title}
                              </Text>
                            </View>
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
                            setSelectedDecks([]);
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
                                  id: players.length,
                                  name: nameInput,
                                  icon: iconSelection,
                                  color: colorSelection,
                                  score: players[i].score,
                                  decks: selectedDecks,
                                });
                              }
                            }
                            setSelectedDecks([]);
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
                          const remainingIcons = possibleIcons.filter(
                            (n) =>
                              !players
                                .map((item, index) => item.icon)
                                .includes(n)
                          );
                          let icon =
                            remainingIcons[
                              Math.floor(currentRand * remainingIcons.length) %
                                remainingIcons.length
                            ];
                          let color =
                            possibleColors[
                              Math.floor(currentRand * possibleColors.length) %
                                possibleColors.length
                            ];
                          // console.log(selectedDecks);
                          // console.log(selectedDecks.length);
                          dispatch(
                            set_players([
                              ...players,
                              {
                                name: nameInput,
                                icon: icon,
                                color: color,
                                score: 0,
                                decks: selectedDecks,
                              },
                            ])
                          );
                          setSelectedDecks([]);
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
                            opacity:
                              nameInput != "" && selectedDecks.length > 0
                                ? 1
                                : 0.3,
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
              {`Order matters – players will take turns clockwise`}
            </Text>
          </View>
          <View
            style={{
              paddingTop: screenWidth * 0.13,
              width: screenWidth * 0.96,
              justifyContent: "center",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {[...Array(players.length + 3 - (players.length % 3)).keys()].map(
              (item, index) => {
                if (index < players.length) {
                  return (
                    <Button
                      key={index}
                      onPress={() => {
                        // console.log("edit", index);
                        setEditingPlayer(index);
                        setSelectedDecks(players[index].decks);
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
                          {`${players[index].name}`}
                        </Text>
                      </View>
                    </Button>
                  );
                } else if (index == players.length) {
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
                          name="add"
                          size={screenWidth * 0.13}
                          color="#0004"
                        />
                        <Text color="#0004" black large>
                          Add
                        </Text>
                      </View>
                    </Button>
                  );
                } else if (index > players.length) {
                  return (
                    <View
                      key={index}
                      style={{
                        margin: screenWidth * 0.025,
                        marginTop: 0,
                        marginBottom: screenWidth * 0.07,
                        width: screenWidth * 0.24,
                        height: screenWidth * 0.22,
                      }}
                    />
                  );
                } else {
                  // console.log("What???");
                  return null;
                }
              }
            )}
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            top: screenWidth * 0.15,
            left: screenWidth * 0.85,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            onPress={() => {
              dispatch(set_stage("edit_decks"));
            }}
          >
            <View
              style={{
                width: screenWidth * 0.1,
                height: screenWidth * 0.1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather
                color={"black"}
                size={screenWidth * 0.06}
                name={"settings"}
              />
            </View>
          </Button>
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
            {`Round ${lcd_turns + 1}`}
          </Text>
          <View
            style={{
              height: screenHeight * 0.8,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center bold color={"#444"}>
                {`Welcome to the Rule of Threes, where players must name three things that fit a category.`}
              </Text>
            </View>
            <Button
              onLongPress={() => {
                dispatch(set_default_time(20));
              }}
              onPress={() => {
                dispatch(set_default_time(default_time + 5));
              }}
            >
              <View
                style={{
                  marginTop: screenWidth * 0.02,
                  width: screenWidth * 0.8,
                  paddingBottom: screenWidth * 0.04,
                }}
              >
                <Text large center bold color={"#444"}>
                  {`Each player has ${default_time} seconds to complete as many cards as possible.`}
                </Text>
              </View>
            </Button>
            <View
              style={{
                marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center bold color={"#444"}>
                {`You can skip cards if you would like.`}
              </Text>
            </View>
            <View
              style={{
                marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                // paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center black color={"#444"}>
                {`${players[0].name} starts 😈`}
              </Text>
            </View>
            <View
              style={{
                // marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center bold color={"#777"}>
                {`(${players[1].name} holds the phone)`}
              </Text>
            </View>
          </View>
          {/* <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingBottom: screenWidth * 0.35,
            }}
          >
            {players.some((item) => item.turns == lcd_turns) ? (
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
                    Order
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
                if (
                  index < players.length &&
                  players[item].turns == lcd_turns
                ) {
                  return (
                    <Button
                      key={index}
                      shrinkOnLong={true}
                      onLongPress={() => {
                        // dispatch(set_selected_player(index));
                        console.log("player grabbed", index);
                        // setEditingPlayer(index);
                      }}
                    >
                      <View
                        style={{
                          margin: screenWidth * 0.015,
                          // height: screenWidth * 0.22,
                          alignItems: "center",
                          justifyContent: "space-between",
                          // flexDirection: "column",
                          // backgroundColor: "red",
                          width: screenWidth * 0.9,
                          // borderWidth: 2,
                          // borderRadius: screenWidth * 0.05,
                          padding: screenWidth * 0.02,
                          // paddingRight: screenWidth * 0.05,
                          // paddingLeft: screenWidth * 0.05,
                          // borderColor:
                          //   selectedPlayer == index ? "#000" : "#0000",
                        }}
                      >
                        <View
                          style={{
                            width: screenWidth * 0.1,
                            height: screenWidth * 0.13,
                            alignItems: "center",
                            // backgroundColor: "red",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons
                            name={"menu"}
                            size={screenWidth * 0.07}
                            color={"#555"}
                          />
                        </View>
                        <View
                          style={{
                            width: screenWidth * 0.6,
                            height: screenWidth * 0.1,
                            alignItems: "center",
                            justifyContent: "center",
                            // marginRight: screenWidth * 0.02,
                            // marginBottom: screenWidth * 0.02,
                            // backgroundColor: "red",
                            // backgroundColor: "green",
                            flexDirection: "row",
                          }}
                        >
                          <View
                            style={{
                              height: screenWidth * 0.13,
                              alignItems: "center",
                              justifyContent: "center",
                              // backgroundColor: "blue",
                              marginRight: screenWidth * 0.05,
                            }}
                          >
                            <FontAwesome5
                              name={players[index].icon}
                              size={screenWidth * 0.1}
                              color={players[index].color}
                            />
                          </View>
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
                            // backgroundColor: "yellow",
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
            {players.some((item) => item.turns > lcd_turns) ? (
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
                if (index < players.length && players[item].turns > lcd_turns) {
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
          </ScrollView> */}
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
        {deckManifestLoaded ? (
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
              // console.log(playable_deck);
              return (
                <Card
                  key={`${item}`}
                  id={item}
                  index={index}
                  deletionCallback={setCardToDelete}
                  deck={playable_deck}
                  rule={Math.floor(item * playable_deck.length)}
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
              <Text center xlarge black color={"black"}>
                {`${
                  players[selectedPlayer]
                    ? players[selectedPlayer].name
                    : "ERROR"
                } is up!`}
              </Text>
              <Text center large bold color={"#555"}>
                {`(${
                  players[(selectedPlayer + 1) % players.length]
                    ? players[(selectedPlayer + 1) % players.length].name
                    : "ERROR"
                } should be holding the phone)`}
              </Text>
            </View>
          </View>
        )}
        <View
          style={{
            position: "absolute",
            top: screenWidth * 0.13,
            left: screenWidth * 0.09,
          }}
        >
          <Shadow
            startColor={"#0002"}
            offset={[0, screenWidth * 0.8 * 0.025]}
            distance={screenWidth * 0.8 * 0.1}
          >
            <Button
              onPress={() => {
                dispatch(set_stage(0));
              }}
            >
              <View
                style={{
                  width: screenWidth * 0.1,
                  height: screenWidth * 0.1,
                  borderRadius: screenWidth * 0.1,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather color={"black"} size={screenWidth * 0.06} name={"x"} />
              </View>
            </Button>
          </Shadow>
        </View>
      </Container>
    );
  } else if (stage == 3) {
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
            {`Round 2`}
          </Text>
          <View
            style={{
              height: screenHeight * 0.8,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center bold color={"#444"}>
                {`In this round, points are DOUBLED,\n the order is reversed,\nand only  ${
                  scoreboard[scoreboard.length - 1].name
                }'s categories will be in play 😘`}
              </Text>
            </View>
            <View
              style={{
                height: screenWidth * 0.065,
                // width: screenWidth,
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
                  Scores
                </Text>
              </View>
            </View>
            <View
              style={{
                width: screenWidth * 0.8,
                marginBottom: screenWidth * 0.1,
              }}
            >
              {scoreboard.map((item, index) => {
                return (
                  <View key={index} style={{ alignItems: "center" }}>
                    <View
                      style={{
                        width: screenWidth * 0.6,
                        height: screenWidth * 0.09,
                        marginBottom: screenWidth * 0.02,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: screenWidth * 0.2,
                        }}
                      >
                        <Text large center black color={"#444"}>
                          {index == 0
                            ? "1st"
                            : index == 1
                            ? "2nd"
                            : index == 3
                            ? "3rd"
                            : `${index}th`}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: screenWidth * 0.4,
                        }}
                      >
                        <Text large center black color={"#444"}>
                          {item.name}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: screenWidth * 0.2,
                        }}
                      >
                        <Text large center black color={"#444"}>
                          {item.score}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            <View
              style={{
                marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                // paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center black color={"#444"}>
                {`${players[players.length - 1].name} starts`}
              </Text>
            </View>
            <View
              style={{
                // marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center bold color={"#777"}>
                {`(${players[players.length - 2].name} holds the phone)`}
              </Text>
            </View>
          </View>
          {/* <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingBottom: screenWidth * 0.35,
            }}
          >
            {players.some((item) => item.turns == lcd_turns) ? (
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
                    Order
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
                if (
                  index < players.length &&
                  players[item].turns == lcd_turns
                ) {
                  return (
                    <Button
                      key={index}
                      shrinkOnLong={true}
                      onLongPress={() => {
                        // dispatch(set_selected_player(index));
                        console.log("player grabbed", index);
                        // setEditingPlayer(index);
                      }}
                    >
                      <View
                        style={{
                          margin: screenWidth * 0.015,
                          // height: screenWidth * 0.22,
                          alignItems: "center",
                          justifyContent: "space-between",
                          // flexDirection: "column",
                          // backgroundColor: "red",
                          width: screenWidth * 0.9,
                          // borderWidth: 2,
                          // borderRadius: screenWidth * 0.05,
                          padding: screenWidth * 0.02,
                          // paddingRight: screenWidth * 0.05,
                          // paddingLeft: screenWidth * 0.05,
                          // borderColor:
                          //   selectedPlayer == index ? "#000" : "#0000",
                        }}
                      >
                        <View
                          style={{
                            width: screenWidth * 0.1,
                            height: screenWidth * 0.13,
                            alignItems: "center",
                            // backgroundColor: "red",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons
                            name={"menu"}
                            size={screenWidth * 0.07}
                            color={"#555"}
                          />
                        </View>
                        <View
                          style={{
                            width: screenWidth * 0.6,
                            height: screenWidth * 0.1,
                            alignItems: "center",
                            justifyContent: "center",
                            // marginRight: screenWidth * 0.02,
                            // marginBottom: screenWidth * 0.02,
                            // backgroundColor: "red",
                            // backgroundColor: "green",
                            flexDirection: "row",
                          }}
                        >
                          <View
                            style={{
                              height: screenWidth * 0.13,
                              alignItems: "center",
                              justifyContent: "center",
                              // backgroundColor: "blue",
                              marginRight: screenWidth * 0.05,
                            }}
                          >
                            <FontAwesome5
                              name={players[index].icon}
                              size={screenWidth * 0.1}
                              color={players[index].color}
                            />
                          </View>
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
                            // backgroundColor: "yellow",
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
            {players.some((item) => item.turns > lcd_turns) ? (
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
                if (index < players.length && players[item].turns > lcd_turns) {
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
          </ScrollView> */}
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
  } else if (stage == 4) {
    return (
      <Container>
        {deckManifestLoaded ? (
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
              // console.log(playable_deck);
              return (
                <Card
                  key={`${item}`}
                  id={item}
                  index={index}
                  deletionCallback={setCardToDelete}
                  deck={playable_deck}
                  rule={Math.floor(item * playable_deck.length)}
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
              <Text center xlarge black color={"black"}>
                {`${
                  players[selectedPlayer]
                    ? players[selectedPlayer].name
                    : "ERROR"
                } is up!`}
              </Text>
              <Text center large bold color={"#555"}>
                {`(${
                  players[(selectedPlayer + 1) % players.length]
                    ? players[(selectedPlayer + 1) % players.length].name
                    : "ERROR"
                } should be holding the phone)`}
              </Text>
            </View>
          </View>
        )}
        <View
          style={{
            position: "absolute",
            top: screenWidth * 0.1,
            left: screenWidth * 0.1,
            backgroundColor: "red",
          }}
        ></View>
      </Container>
    );
  } else if (stage == 5) {
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
            {`Round 3`}
          </Text>
          <View
            style={{
              height: screenHeight * 0.8,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center bold color={"#444"}>
                {`This is the final round.`}
              </Text>
            </View>
            <View
              style={{
                marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center bold color={"#444"}>
                {`In this round, points are TRIPLED, and only  ${scoreboard[0].name}'s categories will be in play.`}
              </Text>
            </View>
            <View
              style={{
                marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center bold color={"#444"}>
                {`You will only get one card, but you get three points per answer.`}
              </Text>
            </View>
            <View
              style={{
                height: screenWidth * 0.065,
                // width: screenWidth,
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
                  Scores
                </Text>
              </View>
            </View>
            <View
              style={{
                width: screenWidth * 0.8,
                marginBottom: screenWidth * 0.1,
              }}
            >
              {scoreboard.map((item, index) => {
                return (
                  <View key={index} style={{ alignItems: "center" }}>
                    <View
                      style={{
                        width: screenWidth * 0.6,
                        height: screenWidth * 0.09,
                        marginBottom: screenWidth * 0.02,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text large center black color={"#444"}>
                        {index == 0
                          ? "1st"
                          : index == 1
                          ? "2nd"
                          : index == 3
                          ? "3rd"
                          : `${index}th`}
                      </Text>
                      <Text large center black color={"#444"}>
                        {item.name}
                      </Text>
                      <Text large center black color={"#444"}>
                        {item.score}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View
              style={{
                marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                // paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center black color={"#444"}>
                {`${players[players.length - 1].name} starts`}
              </Text>
            </View>
            <View
              style={{
                // marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center bold color={"#777"}>
                {`(${players[players.length - 2].name} holds the phone)`}
              </Text>
            </View>
          </View>
          {/* <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingBottom: screenWidth * 0.35,
            }}
          >
            {players.some((item) => item.turns == lcd_turns) ? (
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
                    Order
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
                if (
                  index < players.length &&
                  players[item].turns == lcd_turns
                ) {
                  return (
                    <Button
                      key={index}
                      shrinkOnLong={true}
                      onLongPress={() => {
                        // dispatch(set_selected_player(index));
                        console.log("player grabbed", index);
                        // setEditingPlayer(index);
                      }}
                    >
                      <View
                        style={{
                          margin: screenWidth * 0.015,
                          // height: screenWidth * 0.22,
                          alignItems: "center",
                          justifyContent: "space-between",
                          // flexDirection: "column",
                          // backgroundColor: "red",
                          width: screenWidth * 0.9,
                          // borderWidth: 2,
                          // borderRadius: screenWidth * 0.05,
                          padding: screenWidth * 0.02,
                          // paddingRight: screenWidth * 0.05,
                          // paddingLeft: screenWidth * 0.05,
                          // borderColor:
                          //   selectedPlayer == index ? "#000" : "#0000",
                        }}
                      >
                        <View
                          style={{
                            width: screenWidth * 0.1,
                            height: screenWidth * 0.13,
                            alignItems: "center",
                            // backgroundColor: "red",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons
                            name={"menu"}
                            size={screenWidth * 0.07}
                            color={"#555"}
                          />
                        </View>
                        <View
                          style={{
                            width: screenWidth * 0.6,
                            height: screenWidth * 0.1,
                            alignItems: "center",
                            justifyContent: "center",
                            // marginRight: screenWidth * 0.02,
                            // marginBottom: screenWidth * 0.02,
                            // backgroundColor: "red",
                            // backgroundColor: "green",
                            flexDirection: "row",
                          }}
                        >
                          <View
                            style={{
                              height: screenWidth * 0.13,
                              alignItems: "center",
                              justifyContent: "center",
                              // backgroundColor: "blue",
                              marginRight: screenWidth * 0.05,
                            }}
                          >
                            <FontAwesome5
                              name={players[index].icon}
                              size={screenWidth * 0.1}
                              color={players[index].color}
                            />
                          </View>
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
                            // backgroundColor: "yellow",
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
            {players.some((item) => item.turns > lcd_turns) ? (
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
                if (index < players.length && players[item].turns > lcd_turns) {
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
          </ScrollView> */}
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
  } else if (stage == 6) {
    return (
      <Container>
        {deckManifestLoaded ? (
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
                  deletionCallback={setCardToDelete}
                  deck={playable_deck}
                  rule={Math.floor(item * playable_deck.length)}
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
              <Text center xlarge black color={"black"}>
                {`${
                  players[selectedPlayer]
                    ? players[selectedPlayer].name
                    : "ERROR"
                } is up!`}
              </Text>
              <Text center large bold color={"#555"}>
                {`(${
                  players[(selectedPlayer + 1) % players.length]
                    ? players[(selectedPlayer + 1) % players.length].name
                    : "ERROR"
                } should be holding the phone)`}
              </Text>
            </View>
          </View>
        )}
        <View
          style={{
            position: "absolute",
            top: screenWidth * 0.1,
            left: screenWidth * 0.1,
            backgroundColor: "red",
          }}
        ></View>
      </Container>
    );
  } else if (stage == 7) {
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
            {`${scoreboard[0].name} wins!`}
          </Text>
          <View
            style={{
              height: screenHeight * 0.8,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                marginTop: screenWidth * 0.02,
                width: screenWidth * 0.8,
                paddingBottom: screenWidth * 0.04,
              }}
            >
              <Text large center bold color={"#444"}>
                {`'Twas a hard fought battle.`}
              </Text>
            </View>
            <View
              style={{
                height: screenWidth * 0.065,
                // width: screenWidth,
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
                  Scores
                </Text>
              </View>
            </View>
            <View
              style={{
                width: screenWidth * 0.8,
                marginBottom: screenWidth * 0.1,
              }}
            >
              {scoreboard.map((item, index) => {
                return (
                  <View key={index} style={{ alignItems: "center" }}>
                    <View
                      style={{
                        width: screenWidth * 0.6,
                        height: screenWidth * 0.09,
                        marginBottom: screenWidth * 0.02,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text large center black color={"#444"}>
                        {index == 0
                          ? "1st"
                          : index == 1
                          ? "2nd"
                          : index == 3
                          ? "3rd"
                          : `${index}th`}
                      </Text>
                      <Text large center black color={"#444"}>
                        {item.name}
                      </Text>
                      <Text large center black color={"#444"}>
                        {item.score}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingBottom: screenWidth * 0.35,
            }}
          >
            {players.some((item) => item.turns == lcd_turns) ? (
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
                    Order
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
                if (
                  index < players.length &&
                  players[item].turns == lcd_turns
                ) {
                  return (
                    <Button
                      key={index}
                      shrinkOnLong={true}
                      onLongPress={() => {
                        // dispatch(set_selected_player(index));
                        console.log("player grabbed", index);
                        // setEditingPlayer(index);
                      }}
                    >
                      <View
                        style={{
                          margin: screenWidth * 0.015,
                          // height: screenWidth * 0.22,
                          alignItems: "center",
                          justifyContent: "space-between",
                          // flexDirection: "column",
                          // backgroundColor: "red",
                          width: screenWidth * 0.9,
                          // borderWidth: 2,
                          // borderRadius: screenWidth * 0.05,
                          padding: screenWidth * 0.02,
                          // paddingRight: screenWidth * 0.05,
                          // paddingLeft: screenWidth * 0.05,
                          // borderColor:
                          //   selectedPlayer == index ? "#000" : "#0000",
                        }}
                      >
                        <View
                          style={{
                            width: screenWidth * 0.1,
                            height: screenWidth * 0.13,
                            alignItems: "center",
                            // backgroundColor: "red",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons
                            name={"menu"}
                            size={screenWidth * 0.07}
                            color={"#555"}
                          />
                        </View>
                        <View
                          style={{
                            width: screenWidth * 0.6,
                            height: screenWidth * 0.1,
                            alignItems: "center",
                            justifyContent: "center",
                            // marginRight: screenWidth * 0.02,
                            // marginBottom: screenWidth * 0.02,
                            // backgroundColor: "red",
                            // backgroundColor: "green",
                            flexDirection: "row",
                          }}
                        >
                          <View
                            style={{
                              height: screenWidth * 0.13,
                              alignItems: "center",
                              justifyContent: "center",
                              // backgroundColor: "blue",
                              marginRight: screenWidth * 0.05,
                            }}
                          >
                            <FontAwesome5
                              name={players[index].icon}
                              size={screenWidth * 0.1}
                              color={players[index].color}
                            />
                          </View>
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
                            // backgroundColor: "yellow",
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
            {players.some((item) => item.turns > lcd_turns) ? (
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
                if (index < players.length && players[item].turns > lcd_turns) {
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
          </ScrollView> */}
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
  } else if (stage == "f") {
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
            {false
              ? `player_name wins!`
              : `player_name_1 & player_name_2 & player_name_3 tied!`}
          </Text>
          <View
            style={{
              width: screenWidth,
              justifyContent: "space-evenly",
              flexDirection: "row",
            }}
          >
            <View
              style={{
                height: screenWidth * 0.065,
                width: screenWidth * 0.455,
                alignItems: "center",
                justifyContent: "center",
                // marginLeft: screenWidth * 0.03,
              }}
            >
              <View
                style={{
                  // marginTop: screenWidth * 0.03,
                  // marginBottom: screenWidth * 0.03,
                  position: "absolute",
                  height: screenWidth * 0.002,
                  width: screenWidth * 0.455,
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
                  Final Scores
                </Text>
              </View>
            </View>
            <View
              style={{
                height: screenWidth * 0.065,
                width: screenWidth * 0.455,
                alignItems: "center",
                justifyContent: "center",
                // marginLeft: screenWidth * 0.01,
              }}
            >
              <View
                style={{
                  // marginTop: screenWidth * 0.03,
                  // marginBottom: screenWidth * 0.03,
                  position: "absolute",
                  height: screenWidth * 0.002,
                  width: screenWidth * 0.455,
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
                  Awards
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            style={{
              alignSelf: "flex-start",
              marginLeft: screenWidth * 0.03,
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              // marginTop: screenWidth * 0.01,
              // width: screenWidth * 0.5,
              alignItems: "flex-start",
              justifyContent: "center",
              flexDirection: "column",
              // backgroundColor: "red",
              paddingBottom: screenWidth * 0.35,
            }}
          >
            {[...Array(12).keys()].map((item, index) => {
              if (
                true //index < players.length
              ) {
                return (
                  <Button
                    key={index}
                    onPress={() => {
                      // dispatch(set_selected_player(index));
                      // console.log("edit", index);
                      // setEditingPlayer(index);
                    }}
                  >
                    <View
                      style={{
                        // margin: screenWidth * 0.015,
                        alignItems: "center",
                        justifyContent: "flex-start",
                        flexDirection: "row",
                        width: screenWidth * 0.94,
                        borderWidth: 2,
                        padding: screenWidth * 0.005,
                        borderColor: selectedPlayer == index ? "#000" : "#0000",
                        backgroundColor: "blue",
                      }}
                    >
                      <View
                        style={{
                          width: screenWidth * 0.08,
                          height: screenWidth * 0.08,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FontAwesome5
                          name={false ? players[index].icon : "plane"}
                          size={screenWidth * 0.05}
                          color={false ? players[index].color : "red"}
                        />
                      </View>
                      <View
                        style={{
                          // width: screenWidth * 0.2,
                          height: screenWidth * 0.1,
                          alignItems: "center",
                          justifyContent: "center",
                          // marginRight: screenWidth * 0.02,
                          // marginBottom: screenWidth * 0.02,
                        }}
                      >
                        <Text color={"#555"} black medium>
                          {false ? players[index].name : "Player Name"}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: screenWidth * 0.08,
                          height: screenWidth * 0.08,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text color={"#555"} black large>
                          {false ? players[index].score : 5}
                        </Text>
                      </View>
                      <View
                        style={{
                          marginLeft: screenWidth * 0.075,
                          width: screenWidth * 0.45,
                          height: screenWidth * 0.08,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "orange",
                        }}
                      >
                        <Text color={"#555"} black large>
                          Award name
                        </Text>
                      </View>
                    </View>
                  </Button>
                );
              }
            })}
          </ScrollView>
        </View>
      </Container>
    );
  } else if (stage == "edit_decks") {
    return (
      <Container>
        <View
          style={{
            marginTop: screenWidth * 0.15,
            width: screenWidth,
            height: screenWidth * 0.14,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Button
            onPress={() => {
              dispatch(set_stage(0));
            }}
          >
            <View
              style={{
                width: screenWidth * 0.14,
                height: screenWidth * 0.14,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather
                color={"black"}
                size={screenWidth * 0.07}
                name={"chevron-left"}
              />
            </View>
          </Button>
          <View
            style={{
              width: screenWidth * 0.72,
              height: screenWidth * 0.14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text black xlarge color="black">
              Deck Editor
            </Text>
          </View>
          <View
            style={{
              width: screenWidth * 0.14,
              height: screenWidth * 0.14,
            }}
          />
        </View>
        {/* <View
          style={{
            width: screenWidth,
            height: screenWidth * 0.3,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            onPress={() => {
              test();
            }}
          >
            <Shadow
              startColor={"#0002"}
              offset={[0, screenWidth * 0.8 * 0.025]}
              distance={screenWidth * 0.8 * 0.1}
            >
              <View
                style={{
                  width: screenWidth * 0.6,
                  height: screenWidth * 0.2,
                  borderRadius: screenWidth * 0.05,
                  backgroundColor: "white",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text black xlarge color="black">
                  Test
                </Text>
              </View>
            </Shadow>
          </Button>
        </View> */}
        <View
          style={{
            marginTop: screenWidth * 0.1,
            height: screenWidth * 0.1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text heavy large color="black">
            Rule of Three
          </Text>
        </View>

        <View
          style={{
            width: screenWidth,
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            flexDirection: "row",
          }}
        >
          {[...deck_manifest, null].map((item, index) => {
            if (item == null) {
              return (
                <Button
                  key={index}
                  onPress={() => {
                    console.log("Create new deck");
                    setEditingDeck(true);
                    // if (
                    //   selectedDecks.some((selected) => {
                    //     return index == selected;
                    //   })
                    // ) {
                    //   let tmp = [...selectedDecks];
                    //   for (var i = 0; i < selectedDecks.length; i++) {
                    //     if (selectedDecks[i] == index) {
                    //       tmp.splice(i, 1);
                    //       break;
                    //     }
                    //   }
                    //   setSelectedDecks(tmp);
                    // } else {
                    //   setSelectedDecks([...selectedDecks, index]);
                    // }
                  }}
                >
                  <View
                    style={{
                      width: screenWidth * 0.23,
                      height: screenWidth * 0.15,
                      borderRadius: screenWidth * 0.015,
                      backgroundColor: "gray",
                      margin: screenWidth * 0.02,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 1,
                    }}
                  >
                    <View
                      style={{
                        marginTop: screenWidth * 0.01,
                        marginBottom: screenWidth * 0.01,
                      }}
                    >
                      <Ionicons
                        name={"create"}
                        size={screenWidth * 0.05}
                        color="white"
                      />
                    </View>
                    <Text black medium color="white">
                      New
                    </Text>
                  </View>
                </Button>
              );
            }
            const contents = item.contents;
            return (
              <Button
                key={index}
                onPress={() => {
                  console.log("Editing: ", item.id);

                  setSelectedEditingDeckID(item.id);
                  setSelectedEditingDeckVersion(item.version);
                  setSelectedEditingDeckTitle(contents.title);
                  setSelectedEditingDeckIcon(contents.icon);
                  setSelectedEditingDeckColor(contents.color);
                  setSelectedEditingDeckItems(contents.contents);
                  setEditingDeck(true);
                  // if (
                  //   selectedDecks.some((selected) => {
                  //     return index == selected;
                  //   })
                  // ) {
                  //   let tmp = [...selectedDecks];
                  //   for (var i = 0; i < selectedDecks.length; i++) {
                  //     if (selectedDecks[i] == index) {
                  //       tmp.splice(i, 1);
                  //       break;
                  //     }
                  //   }
                  //   setSelectedDecks(tmp);
                  // } else {
                  //   setSelectedDecks([...selectedDecks, index]);
                  // }
                }}
              >
                <View
                  style={{
                    width: screenWidth * 0.23,
                    height: screenWidth * 0.15,
                    borderRadius: screenWidth * 0.015,
                    backgroundColor: contents.color,
                    margin: screenWidth * 0.02,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 1,
                  }}
                >
                  <View
                    style={{
                      marginTop: screenWidth * 0.01,
                      marginBottom: screenWidth * 0.01,
                    }}
                  >
                    <Ionicons
                      name={contents.icon}
                      size={screenWidth * 0.05}
                      color="white"
                    />
                  </View>
                  <Text black medium color="white">
                    {contents.title}
                  </Text>
                </View>
              </Button>
            );
          })}
          <Modal
            transparent={true}
            animationType={"slide"}
            visible={editingDeck}
          >
            <Pressable
              onPress={() => {
                setEditingDeck(false);
              }}
            >
              <View
                style={{
                  justifyContent: "flex-end",
                  height: screenHeight,
                }}
              >
                <Shadow
                  startColor={"#0002"}
                  offset={[0, screenWidth * 0.8 * 0.025]}
                  distance={screenWidth * 0.8 * 0.1}
                >
                  <Pressable
                    onPress={() => {
                      deckNameRef.current.blur();
                    }}
                  >
                    <View
                      style={{
                        width: screenWidth,
                        height: screenHeight * 0.85,
                        borderTopLeftRadius: screenWidth * 0.08,
                        borderTopRightRadius: screenWidth * 0.08,
                        backgroundColor: "white",
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      <View style={{}}>
                        <TextInput
                          ref={deckNameRef}
                          autoCapitalize={"words"}
                          onEndEditing={() => {
                            // if(selectedDeck)
                            // if (selectedDeckName != "") {
                            //   const remainingIcons = possibleIcons.filter(
                            //     (n) =>
                            //       !players
                            //         .map((item, index) => item.icon)
                            //         .includes(n)
                            //   );
                            //   let icon =
                            //     remainingIcons[
                            //       Math.floor(currentRand * remainingIcons.length) %
                            //         remainingIcons.length
                            //     ];
                            //   let color =
                            //     possibleColors[
                            //       Math.floor(currentRand * possibleColors.length) %
                            //         possibleColors.length
                            //     ];
                            //   dispatch(
                            //     set_players([
                            //       ...players,
                            //       {
                            //         name: nameInput,
                            //         icon: icon,
                            //         color: color,
                            //         score:
                            //           editingPlayer == undefined
                            //             ? 0
                            //             : players[editingPlayer].score,
                            //       },
                            //     ])
                            //   );
                            //   dispatch(set_adding_player(false));
                            // }
                          }}
                          maxLength={15}
                          onChangeText={setSelectedEditingDeckTitle}
                          defaultValue={selectedEditingDeckTitle}
                          placeholder={selectedEditingDeckTitle}
                          placeholderColor={"black"}
                          style={{
                            color: "black",
                            fontSize: screenWidth * 0.06,
                            fontFamily: "Avenir",
                            fontWeight: "700",
                            borderBottomWidth: 1.5,
                            borderColor: "black",
                            marginTop: screenWidth * 0.03,
                          }}
                        />
                      </View>
                      <View
                        style={{
                          width: screenWidth * 0.23,
                          height: screenWidth * 0.15,
                          borderRadius: screenWidth * 0.015,
                          backgroundColor: selectedEditingDeckColor,
                          margin: screenWidth * 0.02,
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: screenWidth * 0.1,
                        }}
                      >
                        <View
                          style={{
                            marginTop: screenWidth * 0.01,
                            marginBottom: screenWidth * 0.01,
                          }}
                        >
                          <Ionicons
                            name={selectedEditingDeckIcon}
                            size={screenWidth * 0.05}
                            color={"white"}
                          />
                        </View>
                        <Text black medium color="white">
                          {selectedEditingDeckTitle}
                        </Text>
                      </View>
                      <HsvColorPicker
                        huePickerHue={state.hue}
                        satValPickerHue={state.hue}
                        satValPickerValue={state.val}
                        satValPickerSaturation={state.sat}
                        onHuePickerPress={onHuePickerChange}
                        onHuePickerDragMove={onHuePickerChange}
                        onSatValPickerPress={onSatValPickerChange}
                        onSatValPickerDragMove={onSatValPickerChange}
                      />
                    </View>
                  </Pressable>
                </Shadow>
              </View>
            </Pressable>
          </Modal>
        </View>
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
