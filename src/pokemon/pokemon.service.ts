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
      if (error.code ===11000){
        throw new BadRequestException(`Pokemon ${ JSON.stringify( error.keyValue)} already exists`)
      }

      //console.log(error)
      throw new InternalServerErrorException(`Cant create pokemon , Check server logs`);
    }
      
  }

  findAll() {
    return `This action returns all pokemon`;
  }

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

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
