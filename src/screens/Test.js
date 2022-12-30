import React, { useState, useEffect } from "react";
import { Dimensions, Animated, View, PanResponder } from "react-native";
import styled from "styled-components";
import Text from "../components/Text";
import Card from "../components/Card";
import Button from "../components/Button";
import Controller from "../components/Controller";
import firebase from "../helpers/config";
import decks from "../helpers/decks";
// import store from "../helpers/store";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default Game = () => {
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

  return (
    <Container>
      <Text>Hellur</Text>
    </Container>
  );
};

const Container = styled.View`
  position: absolute
  height: ${screenHeight}px
  width: ${screenWidth}px
  align-items: center
  justify-content: center
  /* flex-direction: row */
`;
