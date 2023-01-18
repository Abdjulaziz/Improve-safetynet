import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import * as SMS from "expo-sms";
import * as Location from "expo-location";
import { firebase } from "../../config";

export default function ContactListScreen(name) {
  const [contacts, setContacts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [firstName, setFirstName] = useState(name.firstName);
  const [phoneNumber, setPhoneNumber] = useState(name.phoneNumber);
  const [email, setEmail] = useState(name.email);

  useEffect(() => {
    // Fetch the user's information from the server
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setFirstName(snapshot.data().firstName);
          setPhoneNumber(snapshot.data().phoneNumber);
          setEmail(snapshot.data().email);
        } else {
          console.log("User does not exist");
        }
      });
  }, []);

  function saveData() {
    // Send the new data to the server
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({
        firstName: firstName,
        phoneNumber: phoneNumber,
        email: email,
      })
      .then(function () {
        Alert.alert("Dine informationer er opdateret");
      })
      .catch(function (error) {
        console.error("Error saving data: ", error);
      });
  }

  // Skaffer telefonens kontakter lokalt
  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });
        if (data && data.length > 0) {
          setContacts(data);
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    })();
  }, []);

  const addToFavorites = (contact) => {
    if (!favorites.some((favorite) => favorite.id === contact.id)) {
      setFavorites([...favorites, contact]);
    }
  };

  const searchContacts = (term) => {
    setSearchTerm(term);
  };

  const renderContact = ({ item, isFavorite }) => {
    const deleteContact = () => {
      setFavorites(favorites.filter((favorite) => favorite.id !== item.id));
    };
    const sendSMSWithLocation = async (phoneNumber) => {
      try {
        // Skaffer brugerens nuværende lokation
        const location = await Location.getCurrentPositionAsync({});
        // Make a call to the Google Maps Geocoding API
        const apiKey = "YOUR_API_KEY";
        let response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${apiKey}`
        );
        let responseJson = await response.json();
        let address;
        if (
          responseJson.results &&
          responseJson.results.length > 0 &&
          responseJson.results[0].formatted_address
        ) {
          address = responseJson.results[0].formatted_address;
        } else {
          address = `${location.coords.latitude},${location.coords.longitude}`;
        }
        // Construct the Google Maps URL
        let mapsUrl = `https://maps.google.com/?q=${address}`;
        // Send en sms med lokation og tekst besked
        await SMS.sendSMSAsync(
          [phoneNumber],
          `${item.name} prøv at kontakt mig hurtigst muligt jeg er i fare her er min lokation: ${mapsUrl}`
        );
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <View style={styles.contactContainer}>
        <TouchableOpacity onPress={() => addToFavorites(item)}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phoneNumbers[0].number}</Text>
        </TouchableOpacity>
        {isFavorite && (
          <>
            <TouchableOpacity onPress={deleteContact}>
              <Ionicons name="person-remove-outline" size={42} color="green" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => sendSMSWithLocation(item.phoneNumbers[0].number)}
            >
              <Ionicons name="send-outline" size={42} color="green" />
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  // Filtrer kontakter med søgefunktion
  const filteredContacts = contacts.filter((contact) => {
    return contact.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Oplys kontakterken alfabetisk rækkefølge
  const sections = [];
  const sectionTitles = new Set();
  filteredContacts.forEach((contact) => {
    const title = contact.name[0].toUpperCase();
    if (!sectionTitles.has(title)) {
      sectionTitles.add(title);
      sections.push({ title, data: [contact] });
    } else {
      sections.find((section) => section.title === title).data.push(contact);
    }
  });

  const renderSectionHeader = ({ section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.profileContainer}>
          <Ionicons name="ios-person" size={100} color="#15921F" />
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
          />
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveData}>
            <Text style={styles.saveButtonText}>Gem information</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      <View style={styles.searchContainer}>
        <Ionicons name="ios-search" size={24} />

        <TextInput
          style={styles.searchInput}
          placeholder="Søg efter kontakter"
          onChangeText={searchContacts}
          value={searchTerm}
        />
      </View>
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

      {filteredContacts.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          renderSectionHeader={renderSectionHeader}
        />
      ) : (
        <Text style={styles.noContactsText}>No contacts found.</Text>
      )}
      {favorites.length > 0 && (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderContact({ item, isFavorite: true })}
          style={{ backgroundColor: "#f2f2f2", height: 240, borderTopWidth: 5 }}
        />
      )}
    </View>
  );
}
// Styling af profilscreen
const styles = StyleSheet.create({
  container: {
    marginTop: 70,
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,

    zIndex: 1,
    padding: 10,
    backgroundColor: "#f1f1f1",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  contactContainer: {
    padding: 15,
    borderBottomWidth: 3,
    borderColor: "#eee",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  contactPhone: {
    fontSize: 14,
    color: "#666",
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#f1f1f1",
    padding: 8,
  },
  noContactsText: {
    fontSize: 16,
    padding: 8,
    alignSelf: "center",
  },
  deleteButton: {
    color: "red",
  },
  profileContainer: {
    alignItems: "center", // centers horizontally
    justifyContent: "center", // centers vertically
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  phoneText: {
    fontSize: 16,
    color: "grey",
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbdbdb",
    paddingLeft: 10,
    paddingRight: 10,
    margin: 5,
    borderRadius: 5,
  },
  label: {
    fontWeight: "bold",
    marginLeft: 10,
    marginBottom: 5,
  },
});
