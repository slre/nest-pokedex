import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel : Model<Pokemon>
  ){}



  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try{
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;

    }catch(error){
      this.handleExceptions(error);
    }
      
  }

  findAll() {
    return `This action returns all pokemon`;
  }
  /* FIND ONE  */
  async findOne(term: string) {
    let pokemon : Pokemon;
    if( !isNaN(+term) ){ // If is Number
      pokemon = await this.pokemonModel.findOne({ no:term });

    }
    //MongoID
    if( !pokemon && isValidObjectId( term ) ){
      pokemon = await this.pokemonModel.findById( term );
    }

    // Name
    if( !pokemon ){
      pokemon = await this.pokemonModel.findOne({ name:term.toLocaleLowerCase().trim() });
    }

    // Not found
    if( !pokemon ){
      throw new NotFoundException(`Pokemon ${ term } not found `);
    }
    return pokemon;
  }
  /* UPDATE  */
  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );
    //console.log(term,updatePokemonDto );
    if( updatePokemonDto.name ) updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    
    /*
    const updatedPokemon = await pokemon.updateOne( updatePokemonDto, { new:true } ) // { new:true } returns updated object
    return updatedPokemon;
    */
    try{
      await pokemon.updateOne( updatePokemonDto );
      return { ...pokemon.toJSON(),...updatePokemonDto }
    }catch(error){
      this.handleExceptions(error);
    }

    

  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();

    //const result = await this.pokemonModel.findByIdAndDelete( id );
    const { deletedCount } = await this.pokemonModel.deleteOne( { _id:id })

    if( deletedCount === 0 )
      throw new BadRequestException( `Pokemon with ${id} not found` );

    return;
  }


  private handleExceptions( error : any ){
    if (error.code ===11000){
      throw new BadRequestException(`Pokemon ${ JSON.stringify( error.keyValue)} already exists`)
    }
    throw new InternalServerErrorException(`Cant update pokemon , Check server logs`);
  }
}
