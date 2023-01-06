import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { store } from "./src/redux/store";
import { Provider } from "react-redux";

import { createMyNavigator } from "./src/navigators/home";

const My = createMyNavigator();

import Home from "./src/screens/Home";

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <My.Navigator>
          <My.Screen name="Home" component={Home} />
        </My.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
