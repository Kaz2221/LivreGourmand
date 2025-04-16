// backend/builders/UserBuilder.js
const { Utilisateur, Client, Internaute, Ami, Editeur, Gestionnaire, Administrateur } = require('../models');
const bcrypt = require('bcryptjs');

class UserBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.userData = {
      username: '',
      nom: '',
      email: '',
      mot_de_passe: '',
      adresse: '',
      type_utilisateur: 'client'
    };
    return this;
  }

  setUsername(username) {
    this.userData.username = username;
    return this;
  }

  setNom(nom) {
    this.userData.nom = nom;
    return this;
  }

  setEmail(email) {
    this.userData.email = email;
    return this;
  }

  setMotDePasse(motDePasse) {
    this.userData.mot_de_passe = motDePasse;
    return this;
  }

  setAdresse(adresse) {
    this.userData.adresse = adresse;
    return this;
  }

  setTypeUtilisateur(type) {
    const typesValides = ['client', 'internaute', 'ami', 'editeur', 'gestionnaire', 'administrateur'];
    
    if (typesValides.includes(type)) {
      this.userData.type_utilisateur = type;
    } else {
      throw new Error(`Type d'utilisateur non valide: ${type}`);
    }
    
    return this;
  }

  async build() {
    try {
      // Vérifier les champs obligatoires
      if (!this.userData.username || !this.userData.nom || !this.userData.email || !this.userData.mot_de_passe) {
        throw new Error('Tous les champs obligatoires doivent être remplis');
      }

      // Créer l'utilisateur de base
      const utilisateur = await Utilisateur.create(this.userData);

      // Créer le type spécifique d'utilisateur
      let specificUser;
      
      switch (this.userData.type_utilisateur) {
        case 'client':
          specificUser = await Client.create({
            id_utilisateur: utilisateur.id_utilisateur
          });
          break;
        case 'internaute':
          specificUser = await Internaute.create({
            id_utilisateur: utilisateur.id_utilisateur
          });
          break;
        case 'ami':
          specificUser = await Ami.create({
            id_utilisateur: utilisateur.id_utilisateur
          });
          break;
        case 'editeur':
          specificUser = await Editeur.create({
            id_utilisateur: utilisateur.id_utilisateur
          });
          break;
        case 'gestionnaire':
          specificUser = await Gestionnaire.create({
            id_utilisateur: utilisateur.id_utilisateur
          });
          break;
        case 'administrateur':
          specificUser = await Administrateur.create({
            id_utilisateur: utilisateur.id_utilisateur
          });
          break;
      }

      return { utilisateur, specificUser };
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }
}

module.exports = UserBuilder;