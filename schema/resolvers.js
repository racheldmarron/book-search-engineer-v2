const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

 const resolvers = {
        Query: {
          me: async (parent, args, context) => {
            if (context.user) {
              const userData = await User.findOne({ _id: context.user._id })
              .select('-__v -password')
              return userData;
            }
      
            throw new AuthenticationError('Sorry! You are not logged in');
          },
        },
      

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne( { email });
    
            if (!user) {
                throw new AuthenticationError('Hmmm.. no user found with this email!');
            }
    
            const correctPw = await user.isCorrectPassword(password);
    
            if (!correctPw) {
                throw new AuthenticationError('Looks like your password is incorrect');
            }
    
            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);

            return { token, user };
        },

        saveBook: async (parent, { bookId, authors, description, title, image, link }, context) => {
            const book = { bookId, authors, description, title, image, link };
            if(context.user){
                const updateUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: {savedBooks: book} },
                    { new: true }
                )

                return updateUser; 
            }
            throw new AuthenticationError('Sorry! You are not logged in');
        },

        removeBook: async (parent, { bookId }, context) => {
            // const {bookId} = bookId;
            // console.log(temp);
            if(context.user) {
                const updateUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                )
                return updateUser;
            }
            throw new AuthenticationError('Sorry! You are not logged in');
        },
    },
};

module.exports = resolvers;