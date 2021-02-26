db.createUser(
    {
        user: "manager",
        pwd: "Man@115",
        roles: [
            {
                role: "readWrite",
                db: "ticketmanager"
            }
        ]
    }
)