#!/usr/bin/env python3
"""
Application de bureau pour générer des fichiers JSON de test
à partir d'un squelette JSON et d'un schéma Swagger/OpenAPI.
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import json
import os
from pathlib import Path

from data_generator import DataGenerator
from swagger_parser import SwaggerParser
from json_processor import JSONProcessor


class JSONGeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Générateur de données JSON de test")
        self.root.geometry("800x600")
        
        # Variables
        self.skeleton_file = tk.StringVar()
        self.swagger_file = tk.StringVar()
        self.output_file = tk.StringVar()
        self.generated_data = None
        
        # Composants
        self.data_generator = DataGenerator()
        self.swagger_parser = SwaggerParser()
        self.json_processor = JSONProcessor()
        
        self.create_widgets()
        
    def create_widgets(self):
        # Frame principal
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configuration du grid
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        # Titre
        title_label = ttk.Label(main_frame, text="Générateur de données JSON de test", 
                               font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # Section fichier squelette JSON
        ttk.Label(main_frame, text="Fichier squelette JSON :").grid(row=1, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.skeleton_file, width=50).grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5, padx=5)
        ttk.Button(main_frame, text="Parcourir", command=self.browse_skeleton).grid(row=1, column=2, pady=5)
        
        # Section fichier Swagger
        ttk.Label(main_frame, text="Fichier Swagger/OpenAPI :").grid(row=2, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.swagger_file, width=50).grid(row=2, column=1, sticky=(tk.W, tk.E), pady=5, padx=5)
        ttk.Button(main_frame, text="Parcourir", command=self.browse_swagger).grid(row=2, column=2, pady=5)
        
        # Section fichier de sortie
        ttk.Label(main_frame, text="Fichier de sortie :").grid(row=3, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.output_file, width=50).grid(row=3, column=1, sticky=(tk.W, tk.E), pady=5, padx=5)
        ttk.Button(main_frame, text="Parcourir", command=self.browse_output).grid(row=3, column=2, pady=5)
        
        # Boutons d'action
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=4, column=0, columnspan=3, pady=20)
        
        ttk.Button(button_frame, text="Générer les données", 
                  command=self.generate_data).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Sauvegarder", 
                  command=self.save_data).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Quitter", 
                  command=self.root.quit).pack(side=tk.LEFT, padx=5)
        
        # Zone de prévisualisation
        preview_frame = ttk.LabelFrame(main_frame, text="Prévisualisation des données générées", padding="10")
        preview_frame.grid(row=5, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=10)
        preview_frame.columnconfigure(0, weight=1)
        preview_frame.rowconfigure(0, weight=1)
        
        self.preview_text = scrolledtext.ScrolledText(preview_frame, height=15, width=70)
        self.preview_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configuration du redimensionnement
        main_frame.rowconfigure(5, weight=1)
        
    def browse_skeleton(self):
        filename = filedialog.askopenfilename(
            title="Sélectionner le fichier squelette JSON",
            filetypes=[("Fichiers JSON", "*.json"), ("Tous les fichiers", "*.*")]
        )
        if filename:
            self.skeleton_file.set(filename)
            
    def browse_swagger(self):
        filename = filedialog.askopenfilename(
            title="Sélectionner le fichier Swagger/OpenAPI",
            filetypes=[("Fichiers YAML", "*.yaml"), ("Fichiers JSON", "*.json"), ("Tous les fichiers", "*.*")]
        )
        if filename:
            self.swagger_file.set(filename)
            
    def browse_output(self):
        filename = filedialog.asksaveasfilename(
            title="Sélectionner le fichier de sortie",
            defaultextension=".json",
            filetypes=[("Fichiers JSON", "*.json"), ("Tous les fichiers", "*.*")]
        )
        if filename:
            self.output_file.set(filename)
            
    def generate_data(self):
        try:
            # Vérification des fichiers
            if not self.skeleton_file.get():
                messagebox.showerror("Erreur", "Veuillez sélectionner un fichier squelette JSON.")
                return
                
            if not os.path.exists(self.skeleton_file.get()):
                messagebox.showerror("Erreur", "Le fichier squelette JSON n'existe pas.")
                return
            
            # Chargement du squelette
            with open(self.skeleton_file.get(), 'r', encoding='utf-8') as f:
                skeleton = json.load(f)
            
            # Chargement du schéma Swagger si fourni
            swagger_schema = None
            if self.swagger_file.get() and os.path.exists(self.swagger_file.get()):
                swagger_schema = self.swagger_parser.load_swagger(self.swagger_file.get())
            
            # Génération des données
            self.generated_data = self.json_processor.process_json(
                skeleton, swagger_schema, self.data_generator
            )
            
            # Affichage de la prévisualisation
            preview_json = json.dumps(self.generated_data, indent=2, ensure_ascii=False)
            self.preview_text.delete(1.0, tk.END)
            self.preview_text.insert(1.0, preview_json)
            
            messagebox.showinfo("Succès", "Données générées avec succès !")
            
        except Exception as e:
            messagebox.showerror("Erreur", f"Erreur lors de la génération : {str(e)}")
            
    def save_data(self):
        try:
            if not self.generated_data:
                messagebox.showerror("Erreur", "Aucune donnée générée à sauvegarder.")
                return
                
            if not self.output_file.get():
                messagebox.showerror("Erreur", "Veuillez sélectionner un fichier de sortie.")
                return
            
            with open(self.output_file.get(), 'w', encoding='utf-8') as f:
                json.dump(self.generated_data, f, indent=2, ensure_ascii=False)
            
            messagebox.showinfo("Succès", f"Données sauvegardées dans {self.output_file.get()}")
            
        except Exception as e:
            messagebox.showerror("Erreur", f"Erreur lors de la sauvegarde : {str(e)}")


def main():
    root = tk.Tk()
    app = JSONGeneratorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main() 