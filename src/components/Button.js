import React, { useState, useRef, useImperativeHandle } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Image,
  TextInput,
  Easing,
  Text,
  Animated,
  Pressable,
  View,
  Modal,
  Dimensions,
  StatusBar,
} from "react-native";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default Button = (props, ref) => {
  const [pressedIn, setPressedIn] = useState(false);

  return (
    <Pressable
      onPressIn={() => {
        if (props.active == true || props.active == undefined) {
          setPressedIn(true);
          if (props.onPressIn) {
            props.onPressIn();
          }
        }
      }}
      onPressOut={() => {
        if (props.active == true || props.active == undefined) {
          setPressedIn(false);
          if (props.onPressOut) {
            props.onPressOut();
          }
        }
      }}
      onPress={() => {
        if (props.active == true || props.active == undefined) {
          if (props.onPress) {
            props.onPress();
          }
        }
      }}
      onLongPress={() => {
        if (props.active == true || props.active == undefined) {
          if (props.onLongPress) {
            props.onLongPress();
          }
        }
      }}
    >
      <View style={{ transform: [{ scale: pressedIn ? 0.97 : 1 }] }}>
        {props.children}
      </View>
    </Pressable>
  );
};
