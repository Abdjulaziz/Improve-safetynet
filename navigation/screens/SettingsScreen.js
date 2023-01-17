import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { firebase } from "../../config";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Slet bruger",
      "Er du sikker på, at du vil slette din bruger?",
      [
        {
          text: "Annuller",
          onPress: () => console.log("Cancel Pressed"),
          style: "destructive",
        },
        {
          text: "Slet bruger",
          style: { color: "#ff000" },
          onPress: async () => {
            try {
              await firebase.auth().currentUser.delete();
              Alert.alert(
                "Kontoen er slettet",
                "Din bruger er slettet, alle dine informationer er slettet fra vores system."
              );
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={styles.titleText}>Tilladelser</Text>
      <TouchableOpacity style={styles.cards}>
        <Ionicons name="map-outline" size={42} color="green" />
        <Text style={{ paddingLeft: 13, fontWeight: "bold" }}>
          Adgang til lokation{"\n"}
          {"\n"}
          <Text style={{ paddingTop: 4, fontWeight: "300" }}>
            Giver adgang til din nuværnde{"\n"}lokation
          </Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cards}>
        <Ionicons name="people-circle-outline" size={42} color="green" />
        <Text style={{ paddingLeft: 13, fontWeight: "bold" }}>
          Adgang til kontakter {"\n"}
          {"\n"}
          <Text style={{ padding: 4, fontWeight: "300" }}>
            Giver adgang til telefon kontakter
          </Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cards}>
        <Ionicons name="chatbubbles-outline" size={42} color="green" />
        <Text style={{ paddingLeft: 13, fontWeight: "bold" }}>
          Adgang til meddeleser{"\n"}
          {"\n"}
          <Text style={{ padding: 4, fontWeight: "300" }}>
            Giver adgang til at sende meddeleser {"\n"}til favorit kontakter
          </Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cards} onPress={handleDeleteAccount}>
        <Ionicons name="trash-outline" size={42} color="green" />
        <Text style={{ paddingLeft: 13, fontWeight: "bold" }}>
          Slet min bruger{"\n"}
          {"\n"}
          <Text style={{ padding: 4, fontWeight: "300" }}>
            Hvis du sletter din bruger, så er der ikke{"\n"}mulighed for at
            bruge applikationen.
          </Text>
        </Text>
      </TouchableOpacity>

      {/* Log ud funktion */}

      <TouchableOpacity onPress={() => firebase.auth().signOut()}>
        <Text style={styles.Text}>log ud</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fffff",
  },
  Text: {
    position: "relative",
    bottom: -100,
    fontSize: 24,
    color: "#ff0000",
    textAlign: "center",
  },
  cards: {
    flexDirection: "row",
    padding: 5,
    margin: 5,
    backgroundColor: "#F2F2F2",
    width: 300,
    height: 100,
    borderRadius: 5,
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
