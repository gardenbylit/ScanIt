import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  addContact as dbAddContact,
  getContact as dbGetContact,
  getAllContacts as dbGetAllContacts,
  updateContact as dbUpdateContact,
  deleteContact as dbDeleteContact,
  searchContacts as dbSearchContacts,
} from '../services/databaseService';

const ContactContext = createContext();

export const ContactProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAllContacts = useCallback(async () => {
    try {
      setLoading(true);
      const allContacts = await dbGetAllContacts();
      setContacts(allContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addContact = useCallback(async (contactData) => {
    try {
      const newContact = await dbAddContact(contactData);
      setContacts(prev => [newContact, ...prev]);
      return newContact;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  }, []);

  const getContact = useCallback(async (id) => {
    try {
      return await dbGetContact(id);
    } catch (error) {
      console.error('Error getting contact:', error);
      throw error;
    }
  }, []);

  const updateContact = useCallback(async (id, updatedData) => {
    try {
      await dbUpdateContact(id, updatedData);
      setContacts(prev =>
        prev.map(contact =>
          contact.id === id ? { ...contact, ...updatedData } : contact
        )
      );
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }, []);

  const deleteContact = useCallback(async (id) => {
    try {
      await dbDeleteContact(id);
      setContacts(prev => prev.filter(contact => contact.id !== id));
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }, []);

  const searchContacts = useCallback(async (query) => {
    try {
      const results = await dbSearchContacts(query);
      setContacts(results);
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  }, []);

  const value = {
    contacts,
    loading,
    getAllContacts,
    addContact,
    getContact,
    updateContact,
    deleteContact,
    searchContacts,
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContacts must be used within ContactProvider');
  }
  return context;
};