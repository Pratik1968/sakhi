import {Contact,requestPermissionsAsync,ContactField} from 'expo-contacts';

export async function pickContact() {
  const { status } = await requestPermissionsAsync();
  if (status !== 'granted') return null;

  const contact = await Contact.presentPicker(); //
  if (!contact) return null;

  const name = (await contact.getDetails([ContactField.FULL_NAME])).fullName;

  const number = await contact.getPhones()

  return {
    name: name,
    phone: number[0].number,
  };
}