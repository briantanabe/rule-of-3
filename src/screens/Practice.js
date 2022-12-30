import React, { useState, useEffect, useRef } from "react";
import {
  Dimensions,
  Animated,
  View,
  PanResponder,
  Easing,
  Image,
} from "react-native";
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
  increment_current,
  reset_current,
  set_best,
  set_playing,
  set_turn_over,
} from "../redux/reducers/streak";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default Practice = () => {
  const time_left = useSelector((state) => state.streak.time_left);
  const playing = useSelector((state) => state.streak.playing);
  const turn_over = useSelector((state) => state.streak.turn_over);
  const testRef = firebase.firestore().collection("decks");
  const screenFlash = useRef(new Animated.Value(0)).current;
  const [deck, setDeck] = useState([]);
  const [deckLoaded, setDeckLoaded] = useState(false);

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
                time={5}
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
              backgroundColor: "#F43A3A",
              paddingTop: screenWidth * 0.09,
              paddingLeft: screenWidth * 0.1,
              paddingRight: screenWidth * 0.1,
              paddingBottom: screenWidth * 0.09,
              borderRadius: screenWidth * 0.04,
              alignItems: "center",
            }}
          >
            <Text center giant black color={"white"}>
              You're out!
            </Text>
            <View
              style={{
                marginTop: screenWidth * 0.05,
                width: screenWidth * 0.5,
              }}
            >
              <Text center large black color={"white"}>
                Pass the phone until the round ends
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
          }}
        >
          <View
            style={{
              width: screenWidth * 0.8,
            }}
          >
            <Text center xlarge heavy color={"black"}>
              Click the play button!
            </Text>
          </View>
        </View>
      )}
    </Container>
  );
};

const Container = styled.View`
  position: absolute
  height: ${screenHeight}px
  width: ${screenWidth}px
  /* flex-direction: row */
`;
