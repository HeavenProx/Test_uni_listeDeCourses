describe("Gestion de la page de liste de produits", () => {
    beforeEach(() => {
      // Interception du JSON de produits avec une fixture
      cy.intercept('GET', '/liste_produits_quotidien.json', {
        fixture: 'produits.json'
      }).as('getProduits');
  
      cy.visit('/'); // grâce au baseUrl défini dans cypress.config.js

      cy.wait('@getProduits');
    });

  
    it("Affiche les produits dans la liste et met à jour le compteur", () => {
      // Vérifie qu'il y a bien des cartes de produits dans #liste-produits
      cy.get('#liste-produits .card').should('have.length', 12);
  
      // Vérifie que le compteur correspond au nombre de produits dans la fixture
      cy.fixture('produits.json').then((produits) => {
        cy.get('#compteur-produits').should('have.text', produits.length.toString());
      });
    });


    it("Saisit une chaîne de caractères dans le champ de recherche", () => {
        // Saisit le texte "omme" dans le champ de recherche
        cy.get("#recherche").type("omme");

        const titresAttendus = ["Pomme", "Pomme de terre"];

       // Vérifie qu'il y a le bon nombre de cartes
        cy.get("#liste-produits .card").should("have.length", titresAttendus.length);

        // Vérifie que les titres correspondent exactement à ceux attendus
        cy.get("#liste-produits .card-title").each(($el, index) => {
            cy.wrap($el).should("have.text", titresAttendus[index]);
        });

        // Vide la recherche et saisit un nouveau texte (qui ne veut rien dire)
        cy.get('#recherche').clear();
        cy.get("#recherche").type("gddddft");

         // Vérifie qu'aucun produit n'est remonté par cette recherche
        cy.get("#liste-produits .card").should("have.length", 0);
    });


    it("trie les produits par nom (ordre alphabétique)", () => {
         // Sélectionne le tri par nom dans la liste déroulante
        cy.get("#tri").select("nom");
    
         // Récupère tous les titres des produits affichés
        cy.get("#liste-produits .card-title").then(($titles) => {
            // Convertit chaque titre en texte minuscule
            const noms = [...$titles].map(el => el.innerText.trim().toLowerCase());
             // Trie la liste par ordre alphabétique
            const nomsTries = [...noms].sort();
            // Vérifie que l'ordre des noms affichés est le même que celui de la liste triée
            expect(noms).to.deep.equal(nomsTries);
        });

         // Vérifie que le premier produit affiché est bien "Abricot"
        cy.get("#liste-produits .card-title").first().should("have.text", "Abricot");
    });


    it("trie les produits par prix croissant", () => {
           // Sélectionne le tri par prix dans la liste déroulante
        cy.get("#tri").select("prix");
    
        // Récupère tous les produits affichés
        cy.get("#liste-produits .card").then(($cards) => {
            // Extrait les prix à partir du texte dans chaque produit
            const prixTrouves = [...$cards].map(card => {
                const prixText = card.querySelector(".card-text strong").innerText;
                 // Traite le texte pour conserver seulement le nombre
                return parseFloat(prixText.replace("€", "").trim());
            });
    
            // Trie les prix de manière croissante
            const prixTries = [...prixTrouves].sort((a, b) => a - b);
            // Vérifie que l'ordre des prix affichés correspond bien à celui attendu
            expect(prixTrouves).to.deep.equal(prixTries);
        });

        // Vérifie que le premier produit affiché est bien "Sel" (le moins cher)
        cy.get("#liste-produits .card-title").first().should("have.text", "Sel");
    });


    it("trie les produits par quantité en stock croissante", () => {
        // Sélectionne le tri par quantité dans la liste déroulante
        cy.get("#tri").select("quantite");
    
         // Récupère tous les produits
        cy.get("#liste-produits .card").then(($cards) => {
            // Extrait la quantité affichée de chaque produit
            const quantites = [...$cards].map(card => {
                const stockText = card.querySelector(".card-text").innerText;
                // Conserve uniquement le nombre grâce à une expression régulière
                const match = stockText.match(/(\d+)\s+en stock/);
                return match ? parseInt(match[1], 10) : 0;
            });
    
            // Trie les quantités par ordre croissant
            const quantitesTries = [...quantites].sort((a, b) => a - b);
            // Vérifie que l'ordre des produits affichés correspond bien à celui attendu
            expect(quantites).to.deep.equal(quantitesTries);
        });

        // Vérifie que le premier produit affiché est bien "Haricots" (le stock le plus bas)
        cy.get("#liste-produits .card-title").first().should("have.text", "Haricots");
    });    
  });
  