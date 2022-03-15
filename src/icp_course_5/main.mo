import Array "mo:base/Array";
import List "mo:base/List";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Principal "mo:base/Principal";

actor {
    public type Message = {
        text: Text;
        time: Time.Time;
        author: Text;
    };

    public type Microblog = actor {
        set_name: shared(Text) -> async ();
        get_name: shared query() -> async Text;
        follow: shared(Principal) -> async ();
        follows: shared query () -> async [Principal];
        post: shared (Text) -> async ();
        posts: shared query (time: Time.Time) -> async [Message];
        timeline: shared query (time: Time.Time) -> async [Message];
    };

    var name : Text = "";

    public shared func set_name(n: Text) : async () {
        name := n;
    };

    public shared query func get_name() : async Text {
        name
    };

    var followed : List.List<Principal> = List.nil();

    public shared func follow (id: Principal) : async () {
        followed := List.push(id, followed);
    };

    public shared query func follows() : async [Principal] {
        List.toArray(followed)
    };

    var messages : List.List<Message> = List.nil();

    public shared (msg) func post(pwd: Text, text: Text) : async () {
        assert(pwd == "123456");
        let v: Message = {
            text; 
            time = Time.now();
            author = name;
        };
        messages := List.push(v, messages);
    };

    public shared query func posts(since: Time.Time) : async [Message] {
        Array.filter(List.toArray(messages), func (m: Message): Bool { m.time > since })
    };

    public shared func timeline(since: Time.Time) : async [Message] {
        var all : List.List<Message> = List.nil();

        for (id in Iter.fromList(followed)) {
            let canister : Microblog = actor(Principal.toText(id));
            let msgs = await canister.posts(since);
            for ( msg in Iter.fromArray(msgs)) {
                all := List.push(msg, all);
            };
        };

        List.toArray(all)
    };
};
