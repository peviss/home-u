import { ObjectId } from 'mongodb'
import { CRUD } from '../interfaces/crud.interface'
import IProperty from '../models/property.model'
import Property from '../models/property.schema'


class PropertyService implements CRUD {

    async create(property: IProperty) {
        const newProperty = new Property(property)
        await newProperty.save()
    }

    async list(query: any) {
        const properties = await Property.find(query).lean()
        return properties
    }


    async find(id: string) {
        const propertyFound = await Property.findOne({ _id: new ObjectId(id) }).lean()
        return propertyFound
    }

    async update(property: IProperty) {
        //TODO
    }

    async patch(property: IProperty) {
        //TODO
    }

    async delete(id: string) {
        await Property.deleteOne({ _id: new ObjectId(id) }).lean()
    }


}

export default new PropertyService()