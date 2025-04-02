document.addEventListener("DOMContentLoaded", () => {
    // Charger les produits lorsque le DOM est prêt
    chargerProduits();

    // Vérifier l'existence de l'élément avec l'ID "recherche"
    const rechercheInput = document.getElementById("recherche");
    if (rechercheInput) {
        rechercheInput.addEventListener("input", filtrerProduits);
    } else {
        console.warn("L'élément avec l'ID 'recherche' n'a pas été trouvé.");
    }

    // Vérifier l'existence de l'élément pour le tri
    const triSelect = document.getElementById("tri");
    if (triSelect) {
        triSelect.addEventListener("change", filtrerProduits);
    } else {
        console.warn("L'élément avec l'ID 'tri' n'a pas été trouvé.");
    }
});


let produitsGlobaux = [];
let produitsAffiches = 12;
let termeRecherche = "";
let critereTri = "";

function chargerProduits() {
    fetch("/liste_produits_quotidien.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(produits => {
        produitsGlobaux = produits;
        afficherProduits();
    })
    .catch(error => console.error("Erreur lors du chargement des produits:", error));
}

function afficherNombreProduits() {
    const compteurProduits = document.getElementById("compteur-produits");
    const produitsFiltres = produitsGlobaux.filter(produit =>
        produit.nom.toLowerCase().includes(termeRecherche.toLowerCase())
    );
    compteurProduits.textContent = produitsFiltres.length;
}

function afficherProduits() {
    const listeProduits = document.getElementById("liste-produits");
    listeProduits.innerHTML = "<div class='row'></div>";
    const row = listeProduits.querySelector(".row");

    const produitsFiltres = produitsGlobaux.filter(produit =>
        produit.nom.toLowerCase().includes(termeRecherche.toLowerCase())
    );

    // Mettre à jour le compteur de produits
    afficherNombreProduits();
    
    // Tri des produits en fonction du critère choisi
    produitsFiltres.sort((a, b) => {
        if (critereTri === "prix") {
            return a.prix_unitaire - b.prix_unitaire;
        } else if (critereTri === "quantite") {
            return a.quantite_stock - b.quantite_stock;
        }
        return a.nom.localeCompare(b.nom);
    });

    produitsFiltres.slice(0, produitsAffiches).forEach((produit, index) => {
        const col = document.createElement("div");
        col.classList.add("col-md-3", "mb-4");
        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${produit.nom}</h5>
                    <p class="card-text">${produit.quantite_stock} en stock</p>
                    <p class="card-text"><strong>${produit.prix_unitaire.toFixed(2)} €</strong></p>
                    <button class="btn btn-primary btn-sm" data-ajouter="${index}">Ajouter</button>
                </div>
            </div>
        `;
        row.appendChild(col);
    });

    ajouterBoutonAfficherPlus(produitsFiltres);
}


function ajouterBoutonAfficherPlus(produitsFiltres) {
    const listeProduits = document.getElementById("liste-produits");
    let boutonAfficherPlus = document.getElementById("afficher-plus");
    
    if (produitsAffiches < produitsFiltres.length) {
        if (!boutonAfficherPlus) {
            boutonAfficherPlus = document.createElement("button");
            boutonAfficherPlus.id = "afficher-plus";
            boutonAfficherPlus.classList.add("btn", "btn-secondary", "mt-3");
            boutonAfficherPlus.textContent = "Afficher plus";
            boutonAfficherPlus.addEventListener("click", () => {
                produitsAffiches += 12;
                afficherProduits();
            });
            listeProduits.appendChild(boutonAfficherPlus);
        }
    } else if (boutonAfficherPlus) {
        boutonAfficherPlus.remove();
    }
}

function filtrerProduits() {
    termeRecherche = document.getElementById("recherche").value;
    critereTri = document.getElementById("tri").value;
    produitsAffiches = 12; 
    afficherProduits(); 
}

document.addEventListener("click", (event) => {
    if (event.target.matches("[data-ajouter]")) {
        const index = event.target.getAttribute("data-ajouter");
        console.log("bravo");
        ajouterAuPanier(index);
    }
});

function ajouterAuPanier(index) {
    let listeCourses = JSON.parse(localStorage.getItem("listeCourses")) || [];
    const produit = produitsGlobaux[index];

    const produitExistant = listeCourses.find(item => item.nom === produit.nom);

    if (produitExistant) {
        produitExistant.quantite += 1; // Augmente la quantité si le produit existe déjà
    } else {
        listeCourses.push({
            nom: produit.nom,
            quantite: 1,
            prix_unitaire: produit.prix_unitaire
        });
    }

    // Mise à jour du localStorage
    localStorage.setItem("listeCourses", JSON.stringify(listeCourses));

    // Réduction du stock du produit
    produit.quantite_stock -= 1;
    afficherProduits(); // Recharge la liste des produits

    alert(`${produit.nom} ajouté à la liste de courses !`);
}



document.addEventListener("DOMContentLoaded", () => {
    // Vérifie les paramètres de l'URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("showList") === "true") {
        afficherListeCourses(); // Appelle afficherListeCourses si showList est vrai
    }
});

// Écouteur pour les changements dans le localStorage
window.addEventListener("storage", afficherListeCourses); 

function afficherListeCourses() {
    const listeCourses = JSON.parse(localStorage.getItem("listeCourses")) || [];
    const tbody = document.getElementById("liste-course-body");

    if (!tbody) {
        console.error("Élément tbody introuvable !");
        return;
    }

    tbody.innerHTML = ""; // Vide le tbody avant d'ajouter de nouvelles lignes

    listeCourses.forEach((produit, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${produit.nom}</td>
            <td>${produit.prix_unitaire.toFixed(2)} €</td>
            <td class="text-center" style="width: 80px;"> <!-- Fixe la largeur de la colonne -->
                <input type="number" value="${produit.quantite}" min="1" class="form-control form-control-sm" data-index="${index}"> <!-- Utilise form-control-sm pour une taille plus petite -->
            </td>
            <td>${(produit.prix_unitaire * produit.quantite).toFixed(2)} €</td>
            <td class="text-center"> <!-- Centre le bouton -->
                <button class="btn btn-danger btn-sm" data-delete="${index}">Supprimer</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    mettreAJourTotal();
}

// Calcul du total
function mettreAJourTotal() {
    const listeCourses = JSON.parse(localStorage.getItem("listeCourses")) || [];
    const total = listeCourses.reduce((acc, produit) => acc + (produit.prix_unitaire * produit.quantite), 0);
    document.getElementById("total-general").textContent = `${total.toFixed(2)} €`;
}

// Écouteur pour la suppression de produits
document.addEventListener("click", (event) => {
    if (event.target.matches("[data-delete]")) {
        const index = event.target.getAttribute("data-delete");
        let listeCourses = JSON.parse(localStorage.getItem("listeCourses")) || [];
        listeCourses.splice(index, 1); // Supprime le produit de la liste
        localStorage.setItem("listeCourses", JSON.stringify(listeCourses));
        afficherListeCourses(); // Met à jour l'affichage
    }
});

// Modification des quantités
document.addEventListener("input", (event) => {
    if (event.target.matches("[data-index]")) {
        const index = event.target.getAttribute("data-index");
        let listeCourses = JSON.parse(localStorage.getItem("listeCourses")) || [];
        listeCourses[index].quantite = parseInt(event.target.value); // Met à jour la quantité
        localStorage.setItem("listeCourses", JSON.stringify(listeCourses));
        afficherListeCourses(); // Met à jour l'affichage
    }
});

// Écouteur pour vider la liste
document.addEventListener("DOMContentLoaded", () => {
    // Vérifie si on est sur liste.html et que le bouton existe
    const viderListeButton = document.getElementById("vider-liste");
    
    if (viderListeButton) {
        viderListeButton.addEventListener("click", () => {
            // Vider le localStorage
            localStorage.removeItem("listeCourses");
            
            // Mettre à jour l'affichage
            afficherListeCourses();
        });
    }

    // Vérifie les paramètres de l'URL pour afficher la liste si nécessaire
    const params = new URLSearchParams(window.location.search);
    if (params.get("showList") === "true") {
        afficherListeCourses(); // Appelle afficherListeCourses si showList est vrai
    }
});
