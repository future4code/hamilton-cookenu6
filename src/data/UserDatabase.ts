import dotenv from "dotenv";
import { BaseDataBase } from "./BaseDataBase";

dotenv.config();

export class UserDB extends BaseDataBase {
  private static TABLE_NAME = "Users";

  public async createUser(
    id: string,
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    await this.getConnection()
      .insert({
        id,
        name,
        email,
        password,
      })
      .into(UserDB.TABLE_NAME);
  }

  public async getUserByEmail(email: string): Promise<any> {
    const result = await this.getConnection()
      .select("*")
      .from(UserDB.TABLE_NAME)
      .where({ email });
    return result[0];
  }

  public async getUserById(id: string): Promise<any> {
    const result = await this.getConnection()
      .select("*")
      .from(UserDB.TABLE_NAME)
      .where({ id });
    return result[0];
  }

  public async deleteUser(id: string): Promise<any> {
    await this.getConnection().del().from(UserDB.TABLE_NAME).where({ id });
  }

  public async createRecipe(
    id: string,
    title: string,
    description: string
  ): Promise<any> {
    const date = new Date();
    await this.getConnection()
      .insert({
        id,
        title,
        description,
        date,
      })
      .into("Recipes");
  }

  public async getRecipeById(id: string): Promise<any> {
    const result = await this.getConnection()
      .select("*")
      .from("Recipes")
      .where({ id });
    return result[0];
  }

  public async followUser(user_id: string, follower_id: string): Promise<void> {
    await this.getConnection()
      .insert({ user_id, follower_id })
      .into("Followers");
  }

  public async checkId(user_id: string, follower_id: string): Promise<any> {
    const result = await this.getConnection().raw(`
      SELECT * FROM Followers WHERE "${user_id}" AND "${follower_id}"
    `);

    return result[0][0];
  }

  public async unfollowUser(
    user_id: string,
    follower_id: string
  ): Promise<void> {
    await this.getConnection()
      .del()
      .from("Followers")
      .where({ user_id, follower_id });
  }
}
