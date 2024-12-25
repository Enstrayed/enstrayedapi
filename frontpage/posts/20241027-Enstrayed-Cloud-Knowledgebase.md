# Enstrayed Cloud Knowledgebase
This page contains information specific to Enstrayed Cloud. The Nextcloud user manual is available at [docs.nextcloud.com](https://docs.nextcloud.com/server/latest/user_manual/en/). If you have any questions specific to Enstrayed Cloud that aren't answered in this page, please contact Enstrayed.

## Logging In
Enstrayed Cloud (Nextcloud) exclusively uses ECLS for authentication. At the login page click 'Login with ECLS' to login. You cannot use the Nextcloud login page to login.

Many Nextcloud client apps have embedded web browsers for login, and some of these do not work well with ECLS. For these, you will need to use the "Use App Password" option to login instead.

If you want to setup Two Factor Authentication or FIDO2 login, you will need to do so in ECLS. The 2FA settings inside Nextcloud do not do anything.

## Using App Passwords
App Passwords are credentials used to access your Enstrayed Cloud account from a specific application or device. They are created automatically for many Nextcloud clients, or can be created manually.

To create an App Password, follow these steps:
1. Login to Enstrayed Cloud
2. Click your profile in the top right and select 'Personal Settings'.
3. In the sidebar on the left side, select 'Security' and scroll to the bottom of the page.
4. Enter the name of the application or device and click 'Create new app password', this will give you a unique username and password that you can enter in the application.

## Federation Features
Enstrayed Cloud is a Nextcloud instance and as such has various features that allow federation with other Nextcloud instances. **Because you use ECLS to login, your Federated Cloud ID is randomly generated and not based on your username or email.**

You can view your Federated Cloud ID by clicking on your profile in the top right, selecting personal settings and then clicking 'Sharing' in the sidebar on the left.

## Update Personal Information
To update your name or email address, please contact Enstrayed.

## Storage Quota
You can view your usage in Personal Settings -> Personal Information. If you need additional storage, please contact Enstrayed.

## Data Privacy
As described in the Enstrayed Cloud Terms of Service, your files are stored as-is on the server and are not encrypted by default. Appropriate security measures are used to prevent trivial access, however, you are advised to encrypt and backup any sensitive files before uploading.