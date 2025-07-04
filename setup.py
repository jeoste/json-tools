from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="json-test-data-generator",
    version="1.0.0",
    author="Développeur",
    author_email="contact@example.com",
    description="Générateur de données JSON de test à partir de squelettes et schémas Swagger",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/votre-utilisateur/json-test-data-generator",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Software Development :: Testing",
        "Topic :: Software Development :: Code Generators",
    ],
    python_requires=">=3.7",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "json-generator=src.main:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["examples/*.json", "examples/*.yaml"],
    },
) 