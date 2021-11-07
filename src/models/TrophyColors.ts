export enum Medal {
    GOLD = "gold",
    SILVER = "silver",
    BRONZE = "bronze",
    NONE = "none"
}

export const getTrophy = (place: number): Medal => {
    switch (place) {
        case 1: {
            return Medal.GOLD
        }
        case 2: {
            return Medal.SILVER
        }
        case 3: {
            return Medal.BRONZE
        }
        default: {
            return Medal.NONE
        }
    }
}
