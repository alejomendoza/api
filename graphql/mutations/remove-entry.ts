import { GraphQLString, GraphQLBoolean, GraphQLNonNull } from 'graphql';
import { getAuthenticatedUser } from '../../auth/logic';
import Database from '../../database';
import { entriesIndex } from '../../algolia/algolia';
import { cloudinary } from '../../cloudinary/cloudinary';

const removeEntry = {
  type: GraphQLBoolean,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLString)
    },
    cloudinaryPublicId: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(_: any, { id, cloudinaryPublicId }: any, ctx: any) {
    await getAuthenticatedUser(ctx);
    [
      await Database.models.entry.destroy({
        where: { id: id }
      }),
      await entriesIndex.deleteObject(id)
    ];
    cloudinary.v2.api.delete_resources(
      [cloudinaryPublicId],
      (err: any, res: any) => {
        console.log('error', err);
        console.log('response', res);
      }
    );
    return true;
  }
};

export default removeEntry;