import Realm from 'realm';
import { v4 as uuidv4 } from 'uuid';

const ContactSchema = {
  name: 'Contact',
  primaryKey: 'id',
  properties: {
    id: 'string',
    firstName: 'string',
    lastName: 'string',
    title: 'string?',
    company: 'string?',
    email: 'string?',
    phone: 'string?',
    fax: 'string?',
    address: 'string?',
    city: 'string?',
    state: 'string?',
    zipCode: 'string?',
    country: 'string?',
    website: 'string?',
    latitude: 'double?',
    longitude: 'double?',
    frontCardImage: 'string?',
    backCardImage: 'string?',
    notes: 'string?',
    tags: 'string[]',
    isFavorite: 'bool',
    syncStatus: 'string',
    createdAt: 'date',
    updatedAt: 'date',
  },
};

let realm = null;

export const initializeDatabase = async () => {
  try {
    realm = await Realm.open({
      schema: [ContactSchema],
      schemaVersion: 1,
    });
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const addContact = async (contactData) => {
  try {
    const contact = {
      id: uuidv4(),
      ...contactData,
      tags: contactData.tags || [],
      isFavorite: false,
      syncStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    realm.write(() => {
      realm.create('Contact', contact);
    });

    return contact;
  } catch (error) {
    console.error('Add contact error:', error);
    throw error;
  }
};

export const getContact = async (id) => {
  try {
    const contact = realm.objectForPrimaryKey('Contact', id);
    return contact ? JSON.parse(JSON.stringify(contact)) : null;
  } catch (error) {
    console.error('Get contact error:', error);
    throw error;
  }
};

export const getAllContacts = async () => {
  try {
    const contacts = realm.objects('Contact').sorted('createdAt', true);
    return JSON.parse(JSON.stringify(contacts));
  } catch (error) {
    console.error('Get all contacts error:', error);
    throw error;
  }
};

export const updateContact = async (id, updatedData) => {
  try {
    realm.write(() => {
      const contact = realm.objectForPrimaryKey('Contact', id);
      if (contact) {
        Object.assign(contact, {
          ...updatedData,
          updatedAt: new Date(),
          syncStatus: 'pending',
        });
      }
    });
  } catch (error) {
    console.error('Update contact error:', error);
    throw error;
  }
};

export const deleteContact = async (id) => {
  try {
    realm.write(() => {
      const contact = realm.objectForPrimaryKey('Contact', id);
      if (contact) {
        realm.delete(contact);
      }
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    throw error;
  }
};

export const searchContacts = async (query) => {
  try {
    const contacts = realm
      .objects('Contact')
      .filtered(
        `firstName CONTAINS[c] \"${query}\" OR lastName CONTAINS[c] \"${query}\" OR email CONTAINS[c] \"${query}\" OR company CONTAINS[c] \"${query}\"`
      );
    return JSON.parse(JSON.stringify(contacts));
  } catch (error) {
    console.error('Search contacts error:', error);
    throw error;
  }
};

export const closeDatabase = () => {
  if (realm) {
    realm.close();
  }
};