exports.buildHome = (req, res) => {
  const user = req.session.user;
  const isLoggedIn = user !== undefined;

  const welcomeMessage = isLoggedIn
    ? `<h1>Welcome ${user.displayName} to Budgeting With Tiffany</h1>`
    : `<h1>You are logged out.  Try loggin in!</h1>`;

  const homeHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Budget With Tiffany</title>
            <link rel="stylesheet" href="/css/styles.css">
        </head>
        <body>
            ${welcomeMessage}
            <div class="button-container">
                <a href="/api-docs" class="button">Swagger API Docs</a>
                ${
                  isLoggedIn
                    ? `<a href="/logout" class="button">Logout</a>`
                    : `<a href="/login" class="button">Login</a>`
                }
                <a href="https://github.com/tiffanyvoorhees2500/budget" class="button">Documentation</a>
            </div>
        </body>
        <footer>
            <p>Budget With Tiffany || Created by Tiffany Voorhees | 2024 | ©️TiffanyVoorhees |
        </footer>
        </html>
    `;

  res.send(homeHTML);
};
