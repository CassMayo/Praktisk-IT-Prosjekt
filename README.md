# Case:
Our project, Swopp2, aims to address the challenges faced by individuals seeking a simple and affordable way to transport their belongings between cities. Moving, especially large items like a sofa or TV, can be stressful, as traditional shipping services are often expensive, and alternatives like social media platforms can lack reliability. Swopp provides a user-friendly solution for registering delivery orders and tracking shipments in real-time, making the process simpler and more accessible.
We selected this project because it allows us to apply our web development skills using .NET and React, technologies we've studied in our Web Application course. This project offers an opportunity to build a solution that combines a solid backend with an intuitive user interface, addressing real-world logistics challenges.

# Getting started:

## 1. Installation of software:
### **Integrated Development Environment (IDE)**: 
We recommend VS Code as IDE for web application development for Windows, Mac, and
Linux. Link for download: https://code.visualstudio.com/download

### **.NET 8.0 SDK**:
- We need .NET 8.0 SDK for VS Code. Link for download: https://dotnet.microsoft.com/enus/download
- You can refer to the following pages (only) if you need more detailed information:
- https://learn.microsoft.com/en-us/dotnet/core/install/macos
- https://learn.microsoft.com/en-us/dotnet/core/install/windows
- https://learn.microsoft.com/en-us/dotnet/core/install/linux-ubuntu
- https://dotnet.microsoft.com/en-us/download/dotnet/8.0

#### how to check if download was sucessful
Go to your terminal
``` bash
dotnet --v
```
or
``` bash
dotnet --version
```


### Database browsing:
We use DB Browser for SQLite for database browsing in Windows, Mac, and Linux. Choose 
the latest version.
https://sqlitebrowser.org/dl/
Select "DB Browser for SQLite, Standard installer x64" when downloading to Windows, 
assuming that you are using a 64-bit machine.

### Node for front-end development (REACT)
uses v20.16.0 during the course development. Follow the instructions in the link:https://nodejs.org/en/download/
- ** Make sure to use v20.16.0 **
- ** Make sure to adjust to the type of computer (OS) you have for example: Mac or Window **
- ** Check if you have downloaded it successfully by: ``` npm --v ``` and ``` node --v ``` **

## 2. Installation of VS Code Extensions
- Now that you have downloaded everything, run Visual Studio code.
- You may be popped up for installing some extensions. We can install C# Dev Kit. look to left and hover over the icons it will say "Extensions" there you can install "C# Dev Kit"

## 3. Run the code.
- Download the project as zip file and open it in Visual Studio code. You will see an option to open a folder, open the file unzipped.
### 3.1 Download backend packages
Hover to the top it will say "Terminal" click on it and paste these commands:
- Go to the directory
``` bash
cd api
```
- Restore / download all packages
``` bash
dotnet restore
```

- ** If you are getting NuGet errors, make sure you have the same Dotnet version, you can check this by going to the file inside the folder "api" called "api.csproj" **
there you can for example see "```<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.10" />" ``` where the package name is ```Authentication.JwtBearer ```and the version:  ``` Version="8.0.10 ```the Dotnet version used is 8.0.10

### 3.2 Download frontend packages
- Go to swopp-client folder
first make sure to go out of  the api folder
``` bash
cd ..
```
``` bash
cd swopp-client
```
- Download packages
``` bash
npm install
```
This will take a few minute, let it download.

### 3.3  Run the application
Here we need two seperate terminals one for backend and another one for frontend
#### Backend:
- Go to api folder
``` bash
cd api
```
- Build the application
``` bash
dotnet build
```
- Run the server
``` Bash
dotnet run
```
#### Frontend
in another terminal, run the frontend:

- Go to swopp-client folder:
``` bash
cd swopp-client
```
- Run the client side
``` bash
npm start
```
Now wait and  the application should pop up!

# Application Logic
## Key functionalites: flow
- User needs to register
- Redirecited to login page where their password is hashed using JWT for security
- the Token has a time limit when the token is timedout then the user is logged out or non authenticated therefore cant add any more requests.
- The user can then create an order (request) which is a bundle, where the user can add multiple items.
- The user cannot publish an order before it has an item.
- Once an item is added the user can either save it as draft, where they can edit request, add more items, edit items or delete items.
- The status of the package when save is "draft", and will be shown as "draft" in the UI.
- The user can publish the order, which means the status of the package is "Pending"
- While the package is "pending" the user cannot edit the request or item, and add items.
- The user can delete requests whether if its pending or draft, all the items in the bundle will also be deleted.








