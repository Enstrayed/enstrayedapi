# Setting up the UniFi Network Controller on an Orange Pi Zero 3

This page covers the steps I went through to setup the UniFi Network controller on an Orange Pi Zero 3. For no reason obvious to me, this process was overcomplicated and very annoying. 

## Background / The Problem
I purchased the Orange Pi Zero 3 because it was cheap and I wanted to move my UniFi controller out of the Docker container on my main server. The idea was to create a DIY UniFi CloudKey, hence I called mine `shitty-cloudkey`. On the surface, this is rather trivial; Ubiquiti's apt repository includes `arm64` packages and the UniFi controller itself is a Java application, making it rather portable.

The problem is that the UniFi controller depends on MongoDB for its database, and [MongoDB's system requirements](https://www.mongodb.com/docs/manual/administration/production-notes/#arm64) require the ARM V8.4-A microarchitecture at minimum (in english: Cortex A73 cores or later). The Zero 3 has Cortex A53 cores, which do not have the instruction sets required. I never really investigated the reasoning for this, but given that this makes Mongo's published builds incompatible with the Raspberry Pi 4, I find it rather strange, since that doesn't really strike me as an especially old SBC?

## Part 1: Installing Armbian
I'll be honest, I normally don't mess around with SBCs so had no idea what the go-to distro was for RasPi clones. After what was probably less than 30 seconds of searching, I decided to use Armbian since it did exactly what I needed: Debian 12 ready to go.

1. the boring shit
    * `winget install balena.etcher`
    1. Download https://dl.armbian.com/orangepizero3/Bookworm_current_minimal
    2. select the file, select your sd card, press flash, blah blah blah
2. the slightly less boring shit
    1. plug in the SD card, ethernet & power, wait for it to startup
    2. go to your dhcp server and find whatever IP it grabbed for itself
    3. `ssh root@<that ip address>`, default password is `1234` (Thank you armbian devs for letting you do the install process remotely)
    4. Go through the setup process, now is a great time to do a `apt update && apt upgrade`, set a hostname and possibly static IP address
    5. reboot for good measure

## Part 2: Installing MongoDB the dumb way

1. Download and install `libssl1.1`, I don't actually know if this is required anymore but it stops apt from complaining
    1. `curl -OL https://archive.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1n-0+deb10u3_arm64.deb`
    2. `sudo dpkg -i libs<tab complete>`
2. Download and install some old version of MongoDB I found; Won't actually be using the binary from this, but it gives us the systemd unit file and resolves the dependency in apt
    1. `curl -OL https://repo.mongodb.org/apt/ubuntu/dists/bionic/mongodb-org/4.4/multiverse/binary-arm64/mongodb-org-server_4.4.29_arm64.deb`
    2. `sudo dpkg -i mong<tab complete>`
3. Download a `mongod` binary that actually works from a [MongoDB employee's personal GitHub](https://github.com/themattman/mongodb-raspberrypi-binaries) yes really
    * You may want to check for a more up to date build but w/e, select the one marked `pi4`
    1. `curl -OL https://github.com/themattman/mongodb-raspberrypi-binaries/releases/download/r7.0.14-rpi-unofficial/mongodb.ce.pi4.r7.0.14.tar.gz`
    2. `tar xvf mong<tab complete>`
    3. `sudo mv mongod /usr/bin/mongod`
* Side note that I discovered later: UniFi manages the mongod process directly so you can keep the systemd service disabled.

## Part 3: Installing UniFi Network
This next section is loosly modified from Ubiquiti's official setup instructions: https://help.ui.com/hc/en-us/articles/220066768-Updating-and-Installing-Self-Hosted-UniFi-Network-Servers-Linux

1. `sudo apt-get update && sudo apt-get install ca-certificates apt-transport-https`
2. `echo 'deb [ arch=amd64,arm64 ] https://www.ui.com/downloads/unifi/debian stable ubiquiti' | sudo tee /etc/apt/sources.list.d/100-ubnt-unifi.list`
3. `curl -L -o /etc/apt/trusted.gpg.d/unifi-repo.gpg https://dl.ui.com/unifi/unifi-repo.gpg`
4. `sudo apt update`
5. `sudo apt install unifi`

## The End
UniFi should be up and running by this point, if it isn't then bash it with `sudo systemctl restart unifi` until it shows something at `https://<ip here>:8443`. If that still doesnt work, `sudo cat /usr/lib/unifi/logs/server.log` may provide a clue, or maybe it wont. FEW MORE THINGS:

* If you are migrating from another UniFi network install, FOR THE LOVE OF GOD DO NOT USE THE RESTORE BUTTON DURING THE INITIAL SETUP. Go through the setup process, *set your password*, and then go into Settings > System > Backups and use the restore button there. 
* If you, like me, did the above and found out that everything breaks, you can factory reset it by changing `is_default=` to `true` in `/var/lib/unifi/system.properties`. Don't forget to change it back after you run through the setup again.
* I shat out this article at 1 AM so basically did no proof-reading or fact checking so the section about MongoDB's system requirements is probably wrong, LOL.
* Armbian has a lot of warnings about using community editions and I got a rather loud warning during my install saying that I was using an automated build that wasn't for production use. It wasn't marked as such on the website and frankly I don't care. I have to assume this is supposed to be normie-proofing but it, like this entire ordeal, strikes me as bizarre. Recommendation: make sure to take backups somewhat often. 