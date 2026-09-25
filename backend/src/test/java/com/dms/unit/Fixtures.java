package com.dms.unit;

import com.dms.entity.*;

import java.util.ArrayList;

/** Small builders for in-memory entities used by the Mockito unit tests. */
final class Fixtures {

    private Fixtures() {}

    static User user(long id, String username, User.Role role) {
        return User.builder().id(id).username(username).email(username + "@dms.com")
                .fullName("Full " + username).passwordHash("HASH").role(role).build();
    }

    static Tournament tournament(long id, User organizer) {
        return Tournament.builder().id(id).name("Tournament " + id).organizer(organizer)
                .debateType(Tournament.DebateType.ASIAN_PARLIAMENTARY)
                .tournamentType(Tournament.TournamentType.KNOCKOUT).build();
    }

    static School school(long id, String name, Tournament t) {
        return School.builder().id(id).name(name).tournament(t).debaters(new ArrayList<>()).build();
    }

    static Match match(long id, Tournament t, School prop, School opp) {
        return Match.builder().id(id).matchCode("MATCH-" + id).tournament(t)
                .propositionSchool(prop).oppositionSchool(opp).topic("Topic").build();
    }
}
