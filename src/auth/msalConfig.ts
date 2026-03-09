import { PublicClientApplication, type Configuration } from '@azure/msal-browser'

const config: Configuration = {
  auth: {
    clientId: '93477318-6092-420d-871a-62458891582f',
    authority: 'https://login.microsoftonline.com/0a6a3f1b-7943-4bb8-b95f-66a209885909',
    redirectUri: window.location.origin + window.location.pathname,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
}

export const msalInstance = new PublicClientApplication(config)

export const loginRequest = {
  scopes: ['User.Read'],
}
