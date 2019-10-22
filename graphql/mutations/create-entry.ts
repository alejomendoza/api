import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt,
} from 'graphql';
import Database from '../../database';
import Entry from '../types/entry';
import { getAuthenticatedUser } from '../../auth/logic';
import { entriesIndex } from '../../algolia/algolia';

const createEntry = {
  type: Entry,
  args: {
    etag: {
      type: new GraphQLNonNull(GraphQLString),
    },
    imageUrl: {
      type: new GraphQLNonNull(GraphQLString),
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    videoUrl: {
      type: new GraphQLNonNull(GraphQLString),
    },
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    forSale: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    price: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
  async resolve(_: any, args: any, ctx: any) {
    let user = await getAuthenticatedUser(ctx);
    let {
      etag,
      imageUrl,
      description,
      title,
      videoUrl,
      id,
      forSale,
      price,
    } = args;
    let entry = {
      id: id,
      etag: etag,
      imageUrl: imageUrl,
      description: description,
      title: title,
      videoUrl: videoUrl,
      publishedAt: new Date().toISOString(),
      publishedAtTimestamp: Math.floor(new Date().getTime() / 1000),
      forSale: forSale,
      price: price,
    };

    let createdEntry = await Database.models.entry.create(entry);
    let entryIndex: any = entry;
    entryIndex.userDisplayName = user.displayName;
    entryIndex.userUsername = user.username;
    entryIndex.objectID = id;
    entryIndex.testing = user.testing;
    [
      await createdEntry.addEntryOwner(user.id),
      await entriesIndex.addObject(entryIndex),
    ];
  },
};

export default createEntry;
