import { fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import UserCard from "../cards/UserCard";
import PopularList from "./PopularList";

async function RightSidebar() {
  const user = await currentUser();
  if (!user) return null;

  const suggestedUsers = await fetchUsers({
    userId: user.id,
    pageSize: 2,
  });
  return (
    <section className="custom-scrollbar rightsidebar">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">Suggested Users</h3>
        <div className="mt-7 flex w-[300px] flex-col gap-8">
          {suggestedUsers.users.length > 0 ? (
            <>
              {suggestedUsers.users.map((person) => (
                <UserCard
                  key={person.id}
                  id={person.id}
                  name={person.name}
                  username={person.username}
                  imgUrl={person.image}
                />
              ))}
            </>
          ) : (
            <p className="!text-base-regular text-light-3">No users yet</p>
          )}

        </div>
      </div>
      <PopularList />
    </section>
  );
}

export default RightSidebar;
