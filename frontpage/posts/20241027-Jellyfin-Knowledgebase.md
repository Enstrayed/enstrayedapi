# Jellyfin Knowledgebase

## Logging In
Jellyfin uses your ECLS username and password to login. **If you use two factor authentication, you will need to append a semicolon followed by your TOTP code to the password field in order to login.**
* Example without 2FA: `yourPassword`
* Example with 2FA: `yourPassword;123456`

If you have a semicolon in your password but do not have 2FA setup, this will interfere with your ability to login to Jellyfin.

## Media Codecs
Most video content on my Jellyfin is stored in H.265/HEVC, which can cause problems if you are viewing it from a browser or a device that does not support HEVC. It's recommended to use a client specific to your device for the best experience.

## Tailscale
It's recommended to access Jellyfin through Tailscale for an optimal experience. If you do not have Tailscale access to Hawthorne, please contact enstrayed. If you do, you can access Jellyfin through Tailscale at `http://hawthorne.pizzly-catfish.ts.net:8096`. 